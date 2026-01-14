import { useState } from "react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/lib/auth.store";
import { Loader2, User, Smartphone, KeyRound } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

type LoginStep = 'PHONE' | 'OTP' | 'NAME';

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
        if (!value.startsWith("+998 ")) {
            value = "+998 ";
        }
        setPhone(value);
    };

    // Step 1: Send OTP
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

    // Step 2: Verify OTP
    const handleOtpSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        const tg = window.Telegram?.WebApp;
        const telegramId = (tg?.initDataUnsafe?.user as any)?.id?.toString();

        try {
            const res = await api.post('/auth/otp/verify', { phone, code: otp, telegramId });

            if (res.data.isNewUser) {
                // Auto register since we have name
                const tg = window.Telegram?.WebApp;
                const user = tg?.initDataUnsafe?.user as any;
                const telegramId = user?.id?.toString();
                const username = user?.username;

                const regRes = await api.post('/auth/register', {
                    phone,
                    fullName: fullName || 'Mijoz',
                    telegramId,
                    username
                });

                setAuth(regRes.data.user, regRes.data.access_token);
                navigate('/');
            } else {
                setAuth(res.data.user, res.data.access_token);
                navigate('/');
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Kod noto\'g\'ri');
        } finally {
            setIsLoading(false);
        }
    };

    // Step 3: Register Name (This step might be redundant if logic above handles auto-reg, keeping for safety)
    const handleNameSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        const tg = window.Telegram?.WebApp;
        const user = tg?.initDataUnsafe?.user as any;
        const telegramId = user?.id?.toString();
        const username = user?.username;

        try {
            const res = await api.post('/auth/register', {
                phone,
                fullName,
                telegramId,
                username
            });

            setAuth(res.data.user, res.data.access_token);
            navigate('/');
        } catch (error: any) {
            alert(error.response?.data?.message || 'Xatolik yuz berdi');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen flex flex-col items-center justify-center p-4 overflow-hidden">
            <div className="mesh-background" />

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-sm space-y-8 z-10"
            >
                <div className="text-center space-y-2">
                    <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 drop-shadow-sm">Xush kelibsiz!</h1>
                    <p className="text-gray-600 font-medium">
                        {step === 'PHONE' && "Ma'lumotlaringizni kiriting"}
                        {step === 'OTP' && `SMS kodni kiriting: ${phone}`}
                    </p>
                </div>

                <div className="liquid-glass p-8 rounded-[2.5rem] shadow-2xl border-white/40">
                    <AnimatePresence mode="wait">
                        {/* Step 1: Phone & Name */}
                        {step === 'PHONE' && (
                            <motion.div
                                key="phone"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="space-y-6"
                            >
                                <form onSubmit={handlePhoneSubmit} className="space-y-4">
                                    <div className="space-y-4">
                                        <div className="relative group">
                                            <User className="absolute left-4 top-3.5 h-5 w-5 text-gray-500 transition-colors group-focus-within:text-primary" />
                                            <input
                                                type="text"
                                                placeholder="Ismingiz"
                                                value={fullName}
                                                onChange={(e) => setFullName(e.target.value)}
                                                className="liquid-input w-full pl-12 pr-4 py-3 text-lg outline-none ring-2 ring-transparent focus:ring-primary/50 text-gray-900 placeholder:text-gray-400"
                                                required
                                            />
                                        </div>

                                        <div className="relative group">
                                            <Smartphone className="absolute left-4 top-3.5 h-5 w-5 text-gray-500 transition-colors group-focus-within:text-primary" />
                                            <input
                                                type="tel"
                                                value={phone}
                                                onChange={handlePhoneChange}
                                                className="liquid-input w-full pl-12 pr-4 py-3 text-lg outline-none ring-2 ring-transparent focus:ring-primary/50 text-gray-900"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        className="liquid-button w-full h-14 rounded-2xl text-lg font-bold flex items-center justify-center gap-2"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? <Loader2 className="animate-spin" /> : "Kodni olish"}
                                    </button>
                                </form>
                            </motion.div>
                        )}

                        {/* Step 2: OTP */}
                        {step === 'OTP' && (
                            <motion.div
                                key="otp"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <form onSubmit={handleOtpSubmit} className="space-y-4">
                                    <div className="relative group">
                                        <KeyRound className="absolute left-4 top-3.5 h-5 w-5 text-gray-500 transition-colors group-focus-within:text-primary" />
                                        <input
                                            type="text"
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value)}
                                            placeholder="0000"
                                            className="liquid-input w-full pl-12 pr-4 py-3 text-2xl text-center tracking-[1em] font-bold outline-none ring-2 ring-transparent focus:ring-primary/50 text-gray-900"
                                            maxLength={4}
                                            required
                                            autoFocus
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        className="liquid-button w-full h-14 rounded-2xl text-lg font-bold flex items-center justify-center gap-2"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? <Loader2 className="animate-spin" /> : "Tasdiqlash"}
                                    </button>
                                    <button type="button" onClick={() => setStep('PHONE')} className="text-sm text-primary font-medium w-full text-center hover:underline opacity-80 hover:opacity-100 transition-opacity">
                                        Raqamni o'zgartirish
                                    </button>
                                </form>
                            </motion.div>
                        )}

                        {/* Step 3: Name */}
                        {step === 'NAME' && (
                            <motion.div
                                key="name"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <form onSubmit={handleNameSubmit} className="space-y-4">
                                    <div className="relative group">
                                        <User className="absolute left-4 top-3.5 h-5 w-5 text-gray-500 transition-colors group-focus-within:text-primary" />
                                        <input
                                            type="text"
                                            placeholder="Ismingiz (Masalan: Jamshid)"
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            className="liquid-input w-full pl-12 pr-4 py-3 text-lg outline-none ring-2 ring-transparent focus:ring-primary/50 text-gray-900"
                                            required
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        className="liquid-button w-full h-14 rounded-2xl text-lg font-bold flex items-center justify-center gap-2"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? <Loader2 className="animate-spin" /> : "Kirish"}
                                    </button>
                                </form>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
}
