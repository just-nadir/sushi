import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function LoginPage() {
    const [step, setStep] = useState<'PHONE' | 'OTP'>('PHONE');
    const [phone, setPhone] = useState("");
    const [otp, setOtp] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        // Auto-login with Telegram initData if available
        const checkTelegramLogin = async () => {
            const tg = window.Telegram?.WebApp;
            if (tg?.initDataUnsafe?.user) {
                try {
                    const user = tg.initDataUnsafe.user as any;
                    setIsLoading(true);
                    const res = await api.post('/auth/telegram', {
                        telegramId: user.id.toString(),
                        username: user.username,
                        fullName: `${user.first_name} ${user.last_name || ''}`.trim(),
                    });

                    // If we get token immediately, login
                    if (res.data.access_token) {
                        login(res.data.access_token);
                        navigate('/');
                    }
                } catch (error: any) {
                    // If 401 USER_NOT_FOUND, we stay here.
                } finally {
                    setIsLoading(false);
                }
            }
        };

        checkTelegramLogin();
    }, []);

    const handlePhoneSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        const tg = window.Telegram?.WebApp;

        try {
            const user = tg?.initDataUnsafe?.user as any;
            const telegramId = user?.id?.toString() || "test_user_" + Date.now();

            const res = await api.post('/auth/telegram', {
                telegramId: telegramId,
                username: user?.username,
                fullName: user ? `${user.first_name} ${user.last_name || ''}`.trim() : undefined,
                phone: phone
            });

            if (res.data.access_token) {
                login(res.data.access_token);
                navigate('/');
            } else if (res.data.message === 'OTP_SENT') {
                setStep('OTP');
            }
        } catch (error: any) {
            alert("Xatolik: " + (error.response?.data?.message || error.message));
        } finally {
            setIsLoading(false);
        }
    };

    const handleOtpSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        const tg = window.Telegram?.WebApp;

        try {
            const user = tg?.initDataUnsafe?.user as any;
            const telegramId = user?.id?.toString() || "test_user_" + Date.now();

            const res = await api.post('/auth/verify', {
                phone,
                code: otp,
                telegramId: telegramId,
                username: user?.username,
                fullName: user ? `${user.first_name} ${user.last_name || ''}`.trim() : undefined,
            });

            if (res.data.access_token) {
                login(res.data.access_token);
                navigate('/');
            }
        } catch (error: any) {
            alert("Kod noto'g'ri yoki eskirgan");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen px-4 bg-background">
            <div className="w-full max-w-sm space-y-8">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">
                        {step === 'PHONE' ? "Xush kelibsiz!" : "Tasdiqlash"}
                    </h1>
                    <p className="text-muted-foreground">
                        {step === 'PHONE'
                            ? "Davom etish uchun telefon raqamingizni kiriting"
                            : `${phone} raqamiga yuborilgan kodni kiriting (Mock: Server konsoliga qarang)`
                        }
                    </p>
                </div>

                {step === 'PHONE' ? (
                    <form onSubmit={handlePhoneSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <input
                                type="tel"
                                placeholder="+998 90 123 45 67"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                required
                                className="flex h-12 w-full rounded-md border border-input bg-secondary/50 px-3 py-2 text-lg text-center ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            />
                        </div>
                        <Button className="w-full h-12 text-lg font-bold" disabled={isLoading}>
                            {isLoading ? <Loader2 className="animate-spin" /> : "Kod olish"}
                        </Button>
                    </form>
                ) : (
                    <form onSubmit={handleOtpSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <input
                                type="text"
                                placeholder="1234"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                required
                                maxLength={4}
                                className="flex h-12 w-full rounded-md border border-input bg-secondary/50 px-3 py-2 text-lg text-center ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 tracking-widest"
                            />
                        </div>
                        <Button className="w-full h-12 text-lg font-bold" disabled={isLoading}>
                            {isLoading ? <Loader2 className="animate-spin" /> : "Tasdiqlash"}
                        </Button>
                        <button
                            type="button"
                            onClick={() => setStep('PHONE')}
                            className="w-full text-sm text-muted-foreground hover:text-primary"
                        >
                            Raqamni o'zgartirish
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
