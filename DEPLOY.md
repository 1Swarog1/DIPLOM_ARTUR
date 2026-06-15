# Развёртывание проекта (Docker)

Проект состоит из трёх сервисов:

| Сервис   | Технология | Назначение                          |
|----------|------------|-------------------------------------|
| frontend | Next.js    | Интерфейс личного кабинета          |
| backend  | FastAPI    | Отправка и проверка кодов по email  |
| nginx    | Nginx      | Единая точка входа (порт 80)        |

В production nginx проксирует:
- `/` → frontend
- `/api/*` → backend
- `/docs` → документация API (Scalar)

---

## 1. Что нужно на сервере

- **Docker** 24+ и **Docker Compose** v2
- Открытый порт **80** (или другой — через `HTTP_PORT` в `.env`)
- Для отправки писем — Gmail с **паролем приложения**

### Установка Docker (Ubuntu/Debian)

```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
# Перелогиньтесь, чтобы группа docker применилась
docker compose version
```

### Установка Docker (Windows)

Скачайте и установите [Docker Desktop](https://www.docker.com/products/docker-desktop/).

---

## 2. Подготовка проекта на сервере

### Вариант A — клонирование из Git

```bash
git clone <URL-вашего-репозитория> artur_huesos
cd artur_huesos
```

### Вариант B — копирование файлов

Скопируйте всю папку проекта на сервер (SCP, SFTP, WinSCP и т.д.).

---

## 3. Настройка переменных окружения

```bash
cp .env.example .env
```

Откройте `.env` и заполните:

```env
GMAIL_USER=ваша-почта@gmail.com
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx
CORS_ORIGINS=http://localhost
NEXT_PUBLIC_API_URL=
HTTP_PORT=80
```

### Gmail — пароль приложения

1. Включите двухфакторную аутентификацию в Google-аккаунте.
2. Перейдите: [myaccount.google.com](https://myaccount.google.com) → **Безопасность** → **Пароли приложений**.
3. Создайте пароль для «Почта» / «Другое».
4. Вставьте 16-символьный пароль в `GMAIL_APP_PASSWORD`.

> Если Gmail не настроен, код всё равно генерируется — он выводится в логи backend:  
> `docker compose logs backend`

### Переменные для production

| Переменная              | Production (nginx) | Локальная разработка      |
|-------------------------|--------------------|---------------------------|
| `NEXT_PUBLIC_API_URL`   | **пусто**          | `http://localhost:8000`   |
| `CORS_ORIGINS`          | `http://ваш-домен` | `http://localhost:3000`   |
| `HTTP_PORT`             | `80`               | не используется           |

`NEXT_PUBLIC_API_URL` встраивается в frontend **на этапе сборки**. После изменения нужна пересборка:

```bash
docker compose build frontend --no-cache
docker compose up -d
```

---

## 4. Запуск production

Из корня проекта:

```bash
docker compose up -d --build
```

Проверка статуса:

```bash
docker compose ps
docker compose logs -f
```

Откройте в браузере:

- **Сайт:** http://localhost (или IP сервера)
- **API docs:** http://localhost/docs
- **Health:** http://localhost/health

### Остановка

```bash
docker compose down
```

### Обновление после изменений в коде

```bash
git pull          # если используете git
docker compose up -d --build
```

---

## 5. Локальная разработка (без nginx)

Hot-reload для frontend и backend:

```bash
cp .env.example .env
# В .env установите:
# NEXT_PUBLIC_API_URL=http://localhost:8000

docker compose -f docker-compose.dev.yml up --build
```

- Frontend: http://localhost:3000  
- Backend: http://localhost:8000  
- API docs: http://localhost:8000/docs  

---

## 6. Развёртывание на VPS (пошагово)

Пример для Ubuntu-сервера с IP `203.0.113.10`:

```bash
# 1. Подключиться к серверу
ssh user@203.0.113.10

# 2. Установить Docker (если ещё нет)
curl -fsSL https://get.docker.com | sh

# 3. Загрузить проект
git clone <repo> artur_huesos && cd artur_huesos

# 4. Настроить окружение
cp .env.example .env
nano .env   # GMAIL_*, CORS_ORIGINS=http://203.0.113.10

# 5. Запустить
docker compose up -d --build

# 6. Проверить
curl http://localhost/health
```

Откройте `http://203.0.113.10` в браузере.

### Firewall

```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp   # если позже добавите HTTPS
sudo ufw enable
```

---

## 7. Домен и HTTPS (опционально)

Для домена `example.com`:

1. A-запись DNS → IP сервера.
2. В `.env`: `CORS_ORIGINS=http://example.com,https://example.com`
3. Пересоберите frontend (см. выше).

HTTPS через **Certbot** (на хосте, не в Docker):

```bash
sudo apt install certbot
sudo certbot certonly --standalone -d example.com
```

Затем добавьте в `nginx/nginx.conf` блок `listen 443 ssl` и смонтируйте сертификаты в `docker-compose.yml`.  
Либо используйте готовый reverse-proxy вроде [Caddy](https://caddyserver.com/) или [Traefik](https://traefik.io/) перед nginx.

---

## 8. Структура Docker-файлов

```
artur_huesos/
├── docker-compose.yml       # production: backend + frontend + nginx
├── docker-compose.dev.yml   # разработка с hot-reload
├── .env.example
├── nginx/
│   └── nginx.conf
├── backend/
│   ├── Dockerfile
│   └── main.py
└── frontend/
    ├── Dockerfile
    └── next.config.ts       # output: standalone
```

---

## 9. Диагностика проблем

| Проблема | Решение |
|----------|---------|
| Порт 80 занят | В `.env` задайте `HTTP_PORT=8080`, откройте http://localhost:8080 |
| Письма не приходят | Проверьте `GMAIL_*`, смотрите `docker compose logs backend` — код печатается в консоль |
| CORS-ошибка в браузере | Добавьте origin в `CORS_ORIGINS`, перезапустите backend |
| Frontend не видит API | В production `NEXT_PUBLIC_API_URL` должен быть **пустым**; пересоберите frontend |
| Контейнер backend unhealthy | `docker compose logs backend` — ошибка импорта или порта |
| Сборка frontend падает | `docker compose build frontend --no-cache` и смотрите лог |

Полезные команды:

```bash
docker compose logs backend -f
docker compose logs frontend -f
docker compose logs nginx -f
docker compose restart backend
docker compose down -v   # остановить и удалить volumes (если появятся)
```

---

## 10. Без Docker (ручной запуск)

### Backend

```bash
cd backend
python -m venv .venv
# Windows: .venv\Scripts\activate
# Linux/Mac: source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # заполните
uvicorn main:app --host 0.0.0.0 --port 8000
```

### Frontend

```bash
cd frontend
npm install
# Windows PowerShell:
$env:NEXT_PUBLIC_API_URL="http://localhost:8000"
npm run dev
```

---

## Быстрый чеклист

- [ ] Docker установлен
- [ ] Файл `.env` создан из `.env.example`
- [ ] `GMAIL_USER` и `GMAIL_APP_PASSWORD` заполнены
- [ ] `NEXT_PUBLIC_API_URL` пустой для production
- [ ] `docker compose up -d --build` выполнен без ошибок
- [ ] http://localhost открывается, вход по email работает
