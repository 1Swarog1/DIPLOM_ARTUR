"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import axios from "axios";
import { Loader2 } from "lucide-react";
import { apiUrl } from "../lib/api";

const CODE_LENGTH = 6;

export default function Home() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [codeDigits, setCodeDigits] = useState<string[]>(Array(CODE_LENGTH).fill(""));
  const [step, setStep] = useState<"email" | "code">("email");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSendCode = async () => {
    if (!email) return;
    setIsLoading(true);
    setMessage("");
    try {
      // In development, backend is on port 8000
      await axios.post(apiUrl("/api/send-code"), { email });
      setStep("code");
      setMessage("Код отправлен на ваш email");
    } catch (error) {
      console.error(error);
      setMessage("Ошибка отправки кода. Попробуйте еще раз.");
    } finally {
      setIsLoading(false);
    }
  };

  const code = codeDigits.join("");
  const setCode = (digits: string[]) => setCodeDigits(digits);

  const handleCodeInput = (index: number, value: string) => {
    if (value.length > 1) {
      const pasted = value.replace(/\D/g, "").slice(0, CODE_LENGTH);
      const newDigits = [...codeDigits];
      pasted.split("").forEach((d, i) => {
        if (index + i < CODE_LENGTH) newDigits[index + i] = d;
      });
      setCodeDigits(newDigits);
      inputRefs.current[Math.min(index + pasted.length, CODE_LENGTH - 1)]?.focus();
      return;
    }
    const digit = value.replace(/\D/g, "");
    const newDigits = [...codeDigits];
    newDigits[index] = digit;
    setCodeDigits(newDigits);
    if (digit && index < CODE_LENGTH - 1) inputRefs.current[index + 1]?.focus();
  };

  const handleCodeKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !codeDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
      const newDigits = [...codeDigits];
      newDigits[index - 1] = "";
      setCodeDigits(newDigits);
    }
  };

  const handleVerifyCode = async () => {
    if (!code || code.length !== CODE_LENGTH) return;
    setIsLoading(true);
    setMessage("");
    try {
      const response = await axios.post(apiUrl("/api/verify-code"), {
        email,
        code,
      });
      if (response.data.verified) {
        localStorage.setItem("cabinet_email", email);
        const parts = email.split("@")[0].split(".").map((p) => p.replace(/\d/g, ""));
        const rusMap: Record<string, string> = {
          artur: "Артур", roman: "Роман", gadzhiev: "Гаджиев", ivanov: "Иванов", petrov: "Петров",
          alexander: "Александр", alexey: "Алексей", ivan: "Иван", dmitry: "Дмитрий", sergey: "Сергей",
          andrey: "Андрей", mikhail: "Михаил", nikolay: "Николай", vadim: "Вадим", oleg: "Олег", sidorov: "Сидоров",
        };
        const fio = parts.map((p) => rusMap[p.toLowerCase()] || (p.charAt(0).toUpperCase() + p.slice(1))).join(" ");
        if (fio) localStorage.setItem("cabinet_fio", fio);
        router.push("/cabinet");
        return;
      }
    } catch (error) {
      console.error(error);
      setMessage("Неверный код.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#F2F3F7]">
      {/* Header / Logo Area */}
      <header className="px-4 sm:px-6 md:px-8 py-4 sm:py-6 max-w-7xl mx-auto w-full flex items-center">
        <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
          <Image
            src="/logo.jpeg"
            alt="Ростелеком"
            width={96}
            height={96}
            className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-full object-cover flex-shrink-0"
          />
          <div className="text-[#5D46C3] font-bold text-lg sm:text-xl md:text-2xl lg:text-3xl">Ростелеком</div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 md:px-8 w-full max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between w-full gap-12">
          
          {/* Left Side: Text */}
          <div className="hidden md:flex flex-col gap-4 max-w-md">
            <h1 className="text-3xl font-bold text-gray-900">Личный кабинет</h1>
            <p className="text-gray-600 text-lg">
              Персональный помощник в цифровом мире Ростелекома
            </p>
          </div>

          {/* Right Side: Form Card */}
          <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 md:p-10 w-full max-w-md">
            
            {step === "email" ? (
              <>
                <h2 className="text-2xl font-semibold mb-6 text-gray-800">Вход по email</h2>
                <p className="text-gray-500 mb-6 text-sm">
                  Укажите почту, на которые необходимо отправить код подтверждения
                </p>

                <div className="flex flex-col gap-4">
                  <input
                    type="email"
                    placeholder="Введите E-mail"
                    className="w-full p-4 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#ff4f12] transition-all"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  
                  <button
                    onClick={handleSendCode}
                    disabled={isLoading}
                    className="w-full bg-[#ff4f12] hover:bg-[#e64610] text-white font-medium py-4 rounded-lg transition-colors flex justify-center items-center"
                  >
                    {isLoading ? <Loader2 className="animate-spin" /> : "Получить код"}
                  </button>

                  
                </div>

                <div className="mt-6 text-center text-xs text-gray-400 leading-relaxed">
                  Нажимая кнопку «Получить код», вы подтверждаете ознакомление с 
                  <a href="#" className="text-[#ff4f12] hover:underline mx-1">Политикой обработки персональных данных</a>
                  и принимаете условия
                  <a href="#" className="text-[#ff4f12] hover:underline mx-1">пользовательского соглашения</a>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-semibold mb-6 text-gray-800">Введите код</h2>
                <p className="text-gray-500 mb-6 text-sm">
                  Мы отправили код подтверждения на {email}
                </p>

                <div className="flex flex-col gap-4">
                  <div className="flex gap-2 justify-center">
                    {codeDigits.map((digit, i) => (
                      <input
                        key={i}
                        ref={(el) => { inputRefs.current[i] = el; }}
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        className="w-12 h-14 rounded-lg bg-gray-100 border border-gray-200 text-center text-2xl font-medium focus:outline-none focus:ring-2 focus:ring-[#ff4f12] focus:border-transparent"
                        value={digit}
                        onChange={(e) => handleCodeInput(i, e.target.value)}
                        onKeyDown={(e) => handleCodeKeyDown(i, e)}
                      />
                    ))}
                  </div>

                  <button
                    onClick={handleVerifyCode}
                    disabled={isLoading}
                    className="w-full bg-[#ff4f12] hover:bg-[#e64610] text-white font-medium py-4 rounded-lg transition-colors flex justify-center items-center"
                  >
                     {isLoading ? <Loader2 className="animate-spin" /> : "Войти"}
                  </button>
                  
                  <button 
                    onClick={() => { setStep("email"); setCodeDigits(Array(CODE_LENGTH).fill("")); }}
                    className="text-sm text-gray-500 hover:text-[#ff4f12] mt-2"
                  >
                    Вернуться назад
                  </button>
                </div>
              </>
            )}

            {message && (
                <div className={`mt-4 text-center text-sm ${message.includes("Ошибка") || message.includes("Неверный") ? "text-red-500" : "text-green-600"}`}>
                    {message}
                </div>
            )}

            

            <div className="mt-8 text-center">
                <a href="#" className="text-[#ff4f12] font-medium text-sm hover:underline">Помощь</a>
            </div>

          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-4 sm:px-6 md:px-8 py-4 sm:py-6 max-w-7xl mx-auto w-full flex flex-col md:flex-row justify-between items-center text-xs text-gray-400 gap-4">
        <div>© 2026 ПАО «Ростелеком». 18+</div>
        <div className="text-center md:text-right">
            <div>Продолжая использовать наш сайт, вы даете согласие на обработку файлов Cookies и других пользовательских данных в соответствии с <a href="#" className="hover:underline">Политикой конфиденциальности</a> и <a href="#" className="hover:underline">Пользовательским соглашением</a></div>
        </div>
        <div className="flex flex-col items-end">
            <div>Служба поддержки</div>
            <div className="text-lg font-bold text-gray-800">8 929 880 80 08</div>
        </div>
      </footer>
    </div>
  );
}
