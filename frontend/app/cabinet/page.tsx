"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Phone, LogOut, ChevronLeft, ChevronRight, X, Pencil, Wifi, Tv, Smartphone } from "lucide-react";

type ServiceId = "phone" | "internet" | "tv" | "mobile";

const SERVICES: Record<ServiceId, {
  id: ServiceId;
  name: string;
  icon: typeof Phone;
  number: string;
  status: string;
  tariff: string;
  bonuses: string;
  description: string;
  details: string[];
}> = {
  phone: {
    id: "phone",
    name: "Домашний телефон",
    icon: Phone,
    number: "8 800 555-35-35",
    status: "Активна",
    tariff: "Повременный - инд. схема - город (местная), Предварительный выбор Ростелеком (звонки по России и за рубеж)",
    bonuses: "подключено",
    description: "Услуга «Домашний телефон» позволяет совершать местные, междугородные и международные звонки. Оплата производится по факту использования.",
    details: [
      "Местные звонки: от 1,50 ₽/мин",
      "Мобильные по России: от 3,00 ₽/мин",
      "Международные: по тарифам оператора",
      "Подключение бесплатно при наличии линии",
    ],
  },
  internet: {
    id: "internet",
    name: "Домашний интернет",
    icon: Wifi,
    number: "+7 929 880-80-08",
    status: "Активна",
    tariff: "Безлимит 100 Мбит/с",
    bonuses: "подключено",
    description: "Высокоскоростной домашний интернет. Безлимитный трафик, стабильное соединение.",
    details: [
      "Скорость: до 100 Мбит/с",
      "Трафик: безлимитный",
      "Роутер в аренде: 99 ₽/мес",
      "Техподдержка: 24/7",
    ],
  },
  tv: {
    id: "tv",
    name: "Интерактивное ТВ",
    icon: Tv,
    number: "Приставка № 2847",
    status: "Активна",
    tariff: "Базовый пакет + 50 каналов",
    bonuses: "подключено",
    description: "Интерактивное телевидение с функцией записи, паузой и просмотром эфира.",
    details: [
      "Базовый пакет: 199 ₽/мес",
      "HD-каналы: 50 шт",
      "Мультискрин: 2 устройства",
      "Хранилище записи: 100 часов",
    ],
  },
  mobile: {
    id: "mobile",
    name: "Мобильная связь",
    icon: Smartphone,
    number: "+7 929 880-80-08",
    status: "Активна",
    tariff: "Тариф «Всё сразу» — 450 ₽/мес",
    bonuses: "подключено",
    description: "Мобильная связь с безлимитным интернетом и минутами по России.",
    details: [
      "Интернет: безлимит до 30 ГБ на максимальной скорости",
      "Минуты: 500 мин по России",
      "СМС: 500 шт",
      "Роуминг: дополнительные пакеты",
    ],
  },
};

const LATIN_TO_RUS: Record<string, string> = {
  artur: "Артур", roman: "Роман", alexander: "Александр", alexey: "Алексей",
  ivan: "Иван", dmitry: "Дмитрий", sergey: "Сергей", andrey: "Андрей",
  mikhail: "Михаил", nikolay: "Николай", vadim: "Вадим", oleg: "Олег",
  gadzhiev: "Гаджиев", ivanov: "Иванов", petrov: "Петров", sidorov: "Сидоров",
};

function toRussianName(email: string): string {
  const stored = localStorage.getItem("cabinet_fio");
  if (stored) return stored;
  const parts = email.split("@")[0].split(".").map((p) => p.replace(/\d/g, ""));
  return parts
    .map((p) => LATIN_TO_RUS[p.toLowerCase()] || (p.charAt(0).toUpperCase() + p.slice(1)))
    .join(" ")
    .trim() || "Пользователь";
}

const NOTIFICATIONS = [
  {
    title: "Получайте счёт электронными каналами!",
    text: "Электронный счёт – это бесплатно, быстро, удобно и экологично! Настройте доставку счёта за услуги связи на электронную почту.",
    link: "Хочу получить удобный сервис",
  },
  {
    title: "Подключите автопополнение",
    text: "Не допускайте отключения услуг! Настройте автопополнение баланса – списания будут происходить автоматически при достижении минимальной суммы.",
    link: "Настроить автопополнение",
  },
];

export default function CabinetPage() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [bannerVisible, setBannerVisible] = useState(true);
  const [bannerIndex, setBannerIndex] = useState(0);
  const [modal, setModal] = useState<"account" | "service" | null>(null);
  const [selectedServiceId, setSelectedServiceId] = useState<ServiceId>("phone");
  const [showServicePicker, setShowServicePicker] = useState(false);

  useEffect(() => {
    const email = localStorage.getItem("cabinet_email");
    if (!email) {
      router.replace("/");
      return;
    }
    setUserEmail(email);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("cabinet_email");
    router.replace("/");
  };

  if (!userEmail) return null;

  const fullName = toRussianName(userEmail);
  const shortName = fullName.split(" ")[0] || fullName;
  const currentBanner = NOTIFICATIONS[bannerIndex];
  const currentService = SERVICES[selectedServiceId];
  const ServiceIcon = currentService.icon;

  return (
    <div className="min-h-screen flex flex-col bg-[#F2F3F7]">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
          <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
            <Link href="/cabinet" className="flex items-center gap-2 sm:gap-3 min-w-0">
              <Image
                src="/logo.png"
                alt="Ростелеком"
                width={96}
                height={96}
                className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 object-contain flex-shrink-0"
              />
              <div className="min-w-0 flex items-center gap-2 sm:gap-4">
                <span className="text-[#5D46C3] font-bold text-lg sm:text-xl md:text-2xl truncate">Ростелеком</span>
                <h1 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 hidden md:block border-l border-gray-200 pl-4">
                  Единый личный кабинет
                </h1>
              </div>
            </Link>
          </div>
          <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-4">
            <span className="text-gray-700 font-medium text-sm sm:text-base truncate">{fullName}</span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition-colors"
            >
              <LogOut size={18} />
              Выйти
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8">
        {/* Notification Banner */}
        {bannerVisible && (
          <div className="mb-6 sm:mb-8 rounded-xl bg-amber-50 border border-amber-200 p-4 sm:p-5 flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">
                {shortName}! {currentBanner.title}
              </div>
              <p className="text-sm text-gray-600">
                {currentBanner.text}{" "}
                <a href="#" className="text-[#ff4f12] hover:underline font-medium">
                  {currentBanner.link}
                </a>
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => setBannerIndex((i) => (i === 0 ? NOTIFICATIONS.length - 1 : i - 1))}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <ChevronLeft size={20} />
              </button>
              <span className="text-xs text-gray-500 whitespace-nowrap">
                {bannerIndex + 1} из {NOTIFICATIONS.length}
              </span>
              <button
                onClick={() => setBannerIndex((i) => (i === NOTIFICATIONS.length - 1 ? 0 : i + 1))}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <ChevronRight size={20} />
              </button>
              <button
                onClick={() => setBannerVisible(false)}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        )}

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {/* Account Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-800">
                Лицевой счёт № <span className="text-gray-500">+7 929 880-80-08</span>
              </h2>
              <button className="p-1 text-gray-400 hover:text-gray-600">
                <Pencil size={16} />
              </button>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-[#ff4f12] mb-4 sm:mb-5">
              1 488 337,55 ₽
            </div>
            <div className="space-y-1.5 text-sm text-gray-500 mb-6">
              <p>Система оплаты: кредитная</p>
              <p>Автопополнение: не настроено</p>
              <p>Доставка счёта: В Единый личный кабинет</p>
            </div>
            <button
              onClick={() => setModal("account")}
              className="w-full py-3 rounded bg-[#ff4f12] hover:bg-[#e64610] text-white font-medium transition-colors border border-[#ff4f12]"
            >
              Подробнее о счёте
            </button>
          </div>

          {/* Service Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-[#5D46C3]/10 flex items-center justify-center">
                <ServiceIcon className="text-[#5D46C3]" size={22} />
              </div>
              <h2 className="font-semibold text-gray-800">{currentService.name}</h2>
            </div>
            <div className="text-gray-600 mb-4 font-medium">{currentService.number}</div>
            <div className="space-y-1.5 text-sm text-gray-500 mb-6">
              <p>Статус услуги: {currentService.status.toLowerCase()}</p>
              <p className="line-clamp-2">Тариф: {currentService.tariff}</p>
              <p>Бонусы: {currentService.bonuses}</p>
            </div>
            <button
              onClick={() => { setModal("service"); setShowServicePicker(false); }}
              className="w-full py-3 rounded bg-gray-700 hover:bg-gray-800 text-white font-medium transition-colors border border-gray-800"
            >
              Подробнее об услуге
            </button>
          </div>
        </div>
      </main>

      {/* Modal: Подробнее о счёте */}
      {modal === "account" && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setModal(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Лицевой счёт</h3>
              <button
                onClick={() => setModal(null)}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>
            <div className="space-y-5">
              <div>
                <p className="text-sm text-gray-500">Номер счёта</p>
                <p className="text-lg font-medium">+7 929 880-80-08</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Текущий баланс</p>
                <p className="text-2xl font-bold text-[#ff4f12]">1 488 337,55 ₽</p>
              </div>
              <div className="border-t border-gray-100 pt-4 space-y-2">
                <p className="text-sm"><span className="text-gray-500">Система оплаты:</span> кредитная</p>
                <p className="text-sm"><span className="text-gray-500">Автопополнение:</span> не настроено</p>
                <p className="text-sm"><span className="text-gray-500">Доставка счёта:</span> В Единый личный кабинет</p>
              </div>
              <div className="border-t border-gray-100 pt-4">
                <p className="text-sm text-gray-600 font-medium mb-2">О кредитной системе</p>
                <p className="text-sm text-gray-500">
                  Кредитная система оплаты позволяет использовать услуги связи при нулевом или отрицательном балансе в пределах установленного лимита. Кредит предоставляется при положительной кредитной истории.
                </p>
              </div>
              <div className="border-t border-gray-100 pt-4">
                <p className="text-sm text-gray-600 font-medium mb-2">История операций</p>
                <p className="text-sm text-gray-500">Последние операции доступны в разделе «Платежи и списания».</p>
              </div>
            </div>
            <button
              onClick={() => setModal(null)}
              className="mt-6 w-full py-3 rounded bg-[#ff4f12] text-white font-medium"
            >
              Закрыть
            </button>
          </div>
        </div>
      )}

      {/* Modal: Подробнее об услуге */}
      {modal === "service" && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => { setModal(null); setShowServicePicker(false); }}
        >
          <div
            className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {showServicePicker ? (
              <>
                <div className="flex justify-between items-start mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">Выберите услугу</h3>
                  <button
                    onClick={() => { setModal(null); setShowServicePicker(false); }}
                    className="p-1 text-gray-400 hover:text-gray-600"
                  >
                    <X size={24} />
                  </button>
                </div>
                <div className="space-y-3">
                  {(Object.keys(SERVICES) as ServiceId[]).map((id) => {
                    const s = SERVICES[id];
                    const Icon = s.icon;
                    return (
                      <button
                        key={id}
                        onClick={() => {
                          setSelectedServiceId(id);
                          setShowServicePicker(false);
                        }}
                        className={`w-full flex items-center gap-4 p-4 rounded-lg border-2 transition-colors text-left ${
                          selectedServiceId === id
                            ? "border-[#ff4f12] bg-orange-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="w-12 h-12 rounded-lg bg-[#5D46C3]/10 flex items-center justify-center flex-shrink-0">
                          <Icon className="text-[#5D46C3]" size={24} />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{s.name}</p>
                          <p className="text-sm text-gray-500">{s.number}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => setShowServicePicker(false)}
                  className="mt-6 w-full py-3 rounded border border-gray-300 text-gray-700 font-medium hover:bg-gray-50"
                >
                  Назад
                </button>
              </>
            ) : (
              <>
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#5D46C3]/10 flex items-center justify-center">
                      <ServiceIcon className="text-[#5D46C3]" size={22} />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">{currentService.name}</h3>
                  </div>
                  <button
                    onClick={() => setModal(null)}
                    className="p-1 text-gray-400 hover:text-gray-600"
                  >
                    <X size={24} />
                  </button>
                </div>
                <div className="space-y-5">
                  <div>
                    <p className="text-sm text-gray-500">
                      {currentService.id === "phone" ? "Номер телефона" : currentService.id === "mobile" ? "Номер" : "Идентификатор"}
                    </p>
                    <p className="text-lg font-medium">{currentService.number}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Статус услуги</p>
                    <p className="text-green-600 font-medium">{currentService.status}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Тариф</p>
                    <p className="text-sm text-gray-700">{currentService.tariff}</p>
                  </div>
                  <div className="border-t border-gray-100 pt-4">
                    <p className="text-sm"><span className="text-gray-500">Бонусы:</span> {currentService.bonuses}</p>
                  </div>
                  <div className="border-t border-gray-100 pt-4">
                    <p className="text-sm text-gray-600 font-medium mb-2">Описание</p>
                    <p className="text-sm text-gray-500">{currentService.description}</p>
                  </div>
                  <div className="border-t border-gray-100 pt-4">
                    <p className="text-sm text-gray-600 font-medium mb-2">Условия и тарифы</p>
                    <ul className="text-sm text-gray-500 space-y-1">
                      {currentService.details.map((d, i) => (
                        <li key={i}>• {d}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                <button
                  onClick={() => setShowServicePicker(true)}
                  className="mt-4 w-full py-3 rounded border-2 border-[#ff4f12] text-[#ff4f12] font-medium hover:bg-orange-50 transition-colors"
                >
                  Сменить услугу
                </button>
                <button
                  onClick={() => setModal(null)}
                  className="mt-3 w-full py-3 rounded bg-gray-700 text-white font-medium"
                >
                  Закрыть
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="px-6 py-4 max-w-6xl mx-auto w-full text-xs text-gray-400 border-t border-gray-200">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div>© 2026 ПАО «Ростелеком». 18+</div>
          <div className="flex flex-col items-end">
            <div>Служба поддержки</div>
            <div className="text-lg font-bold text-gray-800">8 929 880 80 08</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
