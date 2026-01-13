import { useState } from "react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/lib/auth.store";
import { Button } from "@/components/ui/Button";
import { Loader2, Phone, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

type LoginStep = 'PHONE' | 'OTP' | 'NAME';

export function LoginPage() {
    const [step, setStep] = useState<LoginStep>('PHONE');
    const [phone, setPhone] = useState("");
    const [otp, setOtp] = useState("");
    const [fullName, setFullName] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const { setAuth } = useAuthStore();
    const navigate = useNavigate();

    // Auto-login removed to allow strictly SMS OTP flow and proper logout testing.
    // If we want auto-login later, we should probably check if we have a persisted token (which auth store handles)
    // or rely on the user explicitly logging in.

    // Step 1: Send OTP
    const handlePhoneSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await api.post('/auth/otp/send', { phone });
            setStep('OTP');
        } catch (error: any) {
            alert(error.response?.data?.message || 'Xatolik yuz berdi');
        } finally {
            setIsLoading(false);
        }
    };

    // Step 2: Verify OTP
    const handleOtpSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        const tg = window.Telegram?.WebApp;
        // Use 'any' to bypass TS lint errors for telegram object properties
        const telegramId = (tg?.initDataUnsafe?.user as any)?.id?.toString();

        try {
            const res = await api.post('/auth/otp/verify', { phone, code: otp, telegramId });

            if (res.data.isNewUser) {
                setStep('NAME');
            } else {
                setAuth(res.data.user, res.data.access_token);
                navigate('/');
            }
        } catch (error: any) {
            alert(error.response?.data?.message || 'Kod noto\'g\'ri');
        } finally {
            setIsLoading(false);
        }
    };

    // Step 3: Register Name
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
        <div className="flex flex-col items-center justify-center min-h-screen px-4 bg-background">
            <div className="w-full max-w-sm space-y-8">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">Kiring</h1>
                    <p className="text-muted-foreground">
                        {step === 'PHONE' && "Telefon raqamingizni kiriting"}
                        {step === 'OTP' && `SMS kodni kiriting: ${phone}`}
                        {step === 'NAME' && "Ismingizni kiriting"}
                    </p>
                </div>

                {/* Step 1: Phone */}
                {step === 'PHONE' && (
                    <div className="space-y-4">
                        <Button
                            onClick={() => {
                                const tg = window.Telegram?.WebApp as any;
                                if (tg && tg.requestContact) {
                                    tg.requestContact(async (shared: boolean) => {
                                        if (shared) {
                                            // Handle shared logic if needed in future
                                        }
                                    });
                                }
                            }}
                            className="w-full h-12 bg-blue-500 hover:bg-blue-600 gap-2 mb-4 hidden"
                        >
                            <Phone className="w-5 h-5" /> Raqamni ulashish
                        </Button>

                        <form onSubmit={handlePhoneSubmit} className="space-y-4">
                            <input
                                type="tel"
                                placeholder="+998 90 123 45 67"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="flex h-12 w-full rounded-md border border-input bg-secondary/50 px-3 py-2 text-lg ring-offset-background outline-none focus:ring-2 focus:ring-primary"
                                required
                            />
                            <Button className="w-full h-12 text-lg" disabled={isLoading}>
                                {isLoading ? <Loader2 className="animate-spin" /> : "Kodni olish"}
                            </Button>
                        </form>
                    </div>
                )}

                {/* Step 2: OTP */}
                {step === 'OTP' && (
                    <form onSubmit={handleOtpSubmit} className="space-y-4">
                        <input
                            type="text"
                            placeholder="1111"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            className="flex h-12 w-full rounded-md border border-input bg-secondary/50 px-3 py-2 text-lg text-center tracking-widest ring-offset-background outline-none focus:ring-2 focus:ring-primary"
                            maxLength={4}
                            required
                        />
                        <Button className="w-full h-12 text-lg" disabled={isLoading}>
                            {isLoading ? <Loader2 className="animate-spin" /> : "Tasdiqlash"}
                        </Button>
                        <button type="button" onClick={() => setStep('PHONE')} className="text-sm text-primary w-full text-center hover:underline">
                            Raqamni o'zgartirish
                        </button>
                    </form>
                )}

                {/* Step 3: Name */}
                {step === 'NAME' && (
                    <form onSubmit={handleNameSubmit} className="space-y-4">
                        <div className="relative">
                            <User className="absolute left-3 top-3 h-6 w-6 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Ismingiz (Masalan: Jamshid)"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="flex h-12 w-full rounded-md border border-input bg-secondary/50 pl-11 pr-3 py-2 text-lg ring-offset-background outline-none focus:ring-2 focus:ring-primary"
                                required
                            />
                        </div>
                        <Button className="w-full h-12 text-lg" disabled={isLoading}>
                            {isLoading ? <Loader2 className="animate-spin" /> : "Kirish"}
                        </Button>
                    </form>
                )}
            </div>
        </div>
    );
}
