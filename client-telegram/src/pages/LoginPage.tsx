import { useState } from "react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/lib/auth.store";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

type LoginStep = 'PHONE' | 'OTP';

export function LoginPage() {
    const [step, setStep] = useState<LoginStep>('PHONE');
    const [phone, setPhone] = useState("+998 ");
    const [otp, setOtp] = useState("");
    const [fullName, setFullName] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const { setAuth } = useAuthStore();
    const navigate = useNavigate();

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value;
        if (!value.startsWith("+998 ")) value = "+998 ";
        setPhone(value);
    };

    const handlePhoneSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await api.post('/auth/otp/send', { phone });
            setStep('OTP');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Xatolik yuz berdi');
        } finally {
            setIsLoading(false);
        }
    };

    const handleOtpSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        const tg = window.Telegram?.WebApp;
        const telegramId = (tg?.initDataUnsafe?.user as any)?.id?.toString();

        try {
            const res = await api.post('/auth/otp/verify', { phone, code: otp, telegramId });

            if (res.data.isNewUser) {
                const user = tg?.initDataUnsafe?.user as any;
                const regRes = await api.post('/auth/register', {
                    phone,
                    fullName: fullName || user?.first_name || 'Mijoz',
                    telegramId: user?.id?.toString(),
                    username: user?.username
                });
                setAuth(regRes.data.user, regRes.data.access_token);
            } else {
                setAuth(res.data.user, res.data.access_token);
            }
            navigate('/');
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Kod noto'g'ri");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-white">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-sm space-y-8"
            >
                {/* Logo / Title */}
                <div className="text-center">
                    <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl">🍣</span>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Xush kelibsiz!</h1>
                    <p className="text-gray-500 text-sm mt-1">
                        {step === 'PHONE' ? "Telefon raqamingizni kiriting" : `Kodni kiriting: ${phone}`}
                    </p>
                </div>

                <AnimatePresence mode="wait">
                    {step === 'PHONE' && (
                        <motion.form
                            key="phone"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            onSubmit={handlePhoneSubmit}
                            className="space-y-4"
                        >
                            <input
                                type="text"
                                placeholder="Ismingiz"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="w-full h-13 px-4 py-3.5 bg-gray-50 rounded-xl text-base outline-none focus:ring-2 focus:ring-primary/30 border border-gray-200"
                                required
                            />
                            <input
                                type="tel"
                                value={phone}
                                onChange={handlePhoneChange}
                                className="w-full h-13 px-4 py-3.5 bg-gray-50 rounded-xl text-base outline-none focus:ring-2 focus:ring-primary/30 border border-gray-200"
                                required
                            />
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full h-13 py-3.5 bg-primary text-white rounded-xl font-bold text-base flex items-center justify-center active:scale-[0.98] transition-transform disabled:opacity-50"
                            >
                                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Kodni olish"}
                            </button>
                        </motion.form>
                    )}

                    {step === 'OTP' && (
                        <motion.form
                            key="otp"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            onSubmit={handleOtpSubmit}
                            className="space-y-4"
                        >
                            <input
                                type="text"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                placeholder="0000"
                                className="w-full h-14 px-4 bg-gray-50 rounded-xl text-2xl text-center tracking-[0.5em] font-bold outline-none focus:ring-2 focus:ring-primary/30 border border-gray-200"
                                maxLength={4}
                                required
                                autoFocus
                            />
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full h-13 py-3.5 bg-primary text-white rounded-xl font-bold text-base flex items-center justify-center active:scale-[0.98] transition-transform disabled:opacity-50"
                            >
                                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Tasdiqlash"}
                            </button>
                            <button
                                type="button"
                                onClick={() => setStep('PHONE')}
                                className="w-full text-sm text-primary font-medium text-center py-2"
                            >
                                Raqamni o'zgartirish
                            </button>
                        </motion.form>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}
