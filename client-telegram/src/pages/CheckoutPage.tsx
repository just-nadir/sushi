import { useState, useEffect } from "react";
import { useCartStore } from "@/lib/store";
import { api } from "@/lib/api";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, Copy, MapPin, User, CreditCard, Banknote } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/lib/auth.store";
import { motion } from "framer-motion";

import { useIsInputFocused } from "@/hooks/useIsInputFocused";

export function CheckoutPage() {
    const isInputFocused = useIsInputFocused();
    const { items, total, clearCart } = useCartStore();
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [errorLog, setErrorLog] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: "",
        phone: "+998",
        address: "",
        comment: "",
        paymentType: "CASH",
        location: ""
    });

    const [paymentInfo, setPaymentInfo] = useState({
        card: "8600 1234 5678 9012",
        phone: "+998 90 123 45 67"
    });
    const [deliveryPrice, setDeliveryPrice] = useState(0);

    useEffect(() => {
        // Fetch Settings
        api.get('/settings').then(res => {
            const settings = res.data;
            const newInfo: any = {};
            settings.forEach((s: any) => {
                if (s.key === 'card_number') newInfo.card = s.value;
                if (s.key === 'admin_phone') newInfo.phone = s.value;
                if (s.key === 'delivery_price') setDeliveryPrice(Number(s.value));
            });
            if (newInfo.card || newInfo.phone) {
                setPaymentInfo(prev => ({ ...prev, ...newInfo }));
            }
        }).catch(err => console.error(err));

        if (items.length === 0) {
            navigate("/");
        }

        // Autofill from Auth Store
        if (user) {
            setFormData(prev => ({
                ...prev,
                name: user.fullName || prev.name,
                phone: user.phone || prev.phone
            }));
        } else if (window.Telegram?.WebApp?.initDataUnsafe?.user) {
            // Fallback to Telegram Data if not logged in
            const tgUser = window.Telegram.WebApp.initDataUnsafe.user;
            setFormData(prev => ({
                ...prev,
                name: `${tgUser.first_name} ${tgUser.last_name || ""}`.trim()
            }));
        }
    }, [items, navigate, user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name || !formData.phone || !formData.address) {
            alert("Iltimos, barcha majburiy maydonlarni to'ldiring");
            return;
        }

        setIsSubmitting(true);
        try {
            // 0. Check Store Status (Safe-guard)
            const statusRes = await api.get('/store/status');
            if (!statusRes.data.isOpen) {
                alert(`Uzr! ${statusRes.data.message}`);
                // Refresh page to show blocker
                window.location.reload();
                return;
            }

            // Parse location if exists
            let locationLat = undefined;
            let locationLon = undefined;
            if (formData.location) {
                const [lat, lon] = formData.location.split(',').map(Number);
                locationLat = lat;
                locationLon = lon;
            }

            const orderData = {
                items: items.map(i => ({ productId: i.id, quantity: i.quantity })),
                // totalAmount is calculated on backend
                customerName: formData.name,
                customerPhone: formData.phone,
                address: formData.address,
                comment: formData.comment,
                paymentType: formData.paymentType,
                type: 'DELIVERY',
                locationLat, // Valid numbers
                locationLon  // Valid numbers
            };

            await api.post('/orders', orderData);
            clearCart();
            // Create user session and save phone
            localStorage.setItem('user-phone', formData.phone);

            // Provide Haptic Feedback if available
            if (window.Telegram?.WebApp?.HapticFeedback) {
                window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
            }
            alert("Buyurtmangiz qabul qilindi! 🎉");
            navigate('/history');
        } catch (error: any) {
            console.error("Order error:", error);
            if (window.Telegram?.WebApp?.HapticFeedback) {
                window.Telegram.WebApp.HapticFeedback.notificationOccurred('error');
            }
            // Show detailed error
            if (error.response && error.response.data && error.response.data.message) {
                const msgs = Array.isArray(error.response.data.message)
                    ? error.response.data.message.join('\n')
                    : error.response.data.message;
                setErrorLog(msgs);
            } else {
                setErrorLog("Xatolik yuz berdi: " + error.message);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen pb-32 pt-24">
            {/* Header */}
            <div className="mb-4 px-4">
                <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/20 shadow-lg">
                    <button onClick={() => navigate(-1)} className="p-2 bg-white/20 rounded-xl hover:bg-white/30 text-white transition-colors">
                        <ArrowLeft className="h-5 w-5 text-gray-800" />
                    </button>
                    <h1 className="text-lg font-bold text-gray-900">Buyurtmani rasmiylashtirish</h1>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-6">

                {/* Contact Info */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="liquid-card p-5 space-y-4"
                >
                    <h2 className="font-bold text-gray-900 flex items-center gap-2">
                        <div className="p-1.5 bg-primary/20 rounded-lg">
                            <User className="w-4 h-4 text-primary" />
                        </div>
                        Aloqa ma'lumotlari
                    </h2>
                    <div className="space-y-4">
                        <div className="relative group">
                            <label className="block text-xs font-bold text-gray-500 mb-1 ml-1 uppercase tracking-wider">Ism *</label>
                            <input
                                required
                                className="liquid-input w-full px-4 py-3 outline-none ring-2 ring-transparent focus:ring-primary/50 text-gray-900"
                                placeholder="Ismingiz"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div className="relative group">
                            <label className="block text-xs font-bold text-gray-500 mb-1 ml-1 uppercase tracking-wider">Telefon *</label>
                            <input
                                type="tel"
                                required
                                className="liquid-input w-full px-4 py-3 outline-none ring-2 ring-transparent focus:ring-primary/50 text-gray-900"
                                placeholder="+998 90 123 45 67"
                                value={formData.phone}
                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </div>
                    </div>
                </motion.div>

                {/* Delivery Info */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="liquid-card p-5 space-y-4"
                >
                    <h2 className="font-bold text-gray-900 flex items-center gap-2">
                        <div className="p-1.5 bg-orange-500/20 rounded-lg">
                            <MapPin className="w-4 h-4 text-orange-600" />
                        </div>
                        Yetkazib berish
                    </h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1 ml-1 uppercase tracking-wider">Manzil *</label>
                            <textarea
                                required
                                className="liquid-input w-full px-4 py-3 outline-none ring-2 ring-transparent focus:ring-primary/50 text-gray-900 min-h-[80px]"
                                value={formData.address}
                                onChange={e => setFormData({ ...formData, address: e.target.value })}
                                placeholder="Manzilingizni to'liq kiriting..."
                            />
                            <button type="button" className="mt-2 text-xs font-bold text-primary flex items-center gap-1 hover:underline">
                                <MapPin className="w-3 h-3" />
                                Lokatsiyani yuborish (Tez orada)
                            </button>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1 ml-1 uppercase tracking-wider">Izoh (ixtiyoriy)</label>
                            <input
                                className="liquid-input w-full px-4 py-3 outline-none ring-2 ring-transparent focus:ring-primary/50 text-gray-900"
                                placeholder="Domofon kodi, eshik raqami..."
                                value={formData.comment}
                                onChange={e => setFormData({ ...formData, comment: e.target.value })}
                            />
                        </div>
                    </div>
                </motion.div>

                {/* Payment */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="liquid-card p-5 space-y-4"
                >
                    <h2 className="font-bold text-gray-900 flex items-center gap-2">
                        <div className="p-1.5 bg-green-500/20 rounded-lg">
                            <CreditCard className="w-4 h-4 text-green-600" />
                        </div>
                        To'lov turi
                    </h2>
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            type="button"
                            onClick={() => setFormData({ ...formData, paymentType: 'CASH' })}
                            className={`p-4 rounded-2xl border transition-all flex flex-col items-center justify-center gap-2 ${formData.paymentType === 'CASH'
                                ? 'bg-primary text-white border-primary shadow-lg shadow-primary/30'
                                : 'bg-white/40 border-white/40 text-gray-600 hover:bg-white/60'
                                }`}
                        >
                            <Banknote className="w-6 h-6" />
                            <span className="font-bold text-sm">Naqd</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setFormData({ ...formData, paymentType: 'card' })}
                            className={`p-4 rounded-2xl border transition-all flex flex-col items-center justify-center gap-2 ${formData.paymentType === 'card'
                                ? 'bg-primary text-white border-primary shadow-lg shadow-primary/30'
                                : 'bg-white/40 border-white/40 text-gray-600 hover:bg-white/60'
                                }`}
                        >
                            <CreditCard className="w-6 h-6" />
                            <span className="font-bold text-sm text-center">Karta (Click/Payme)</span>
                        </button>
                    </div>

                    {formData.paymentType === 'card' && (
                        <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4 text-sm space-y-3 backdrop-blur-sm">
                            <p className="font-medium text-blue-900">
                                ℹ️ Hozircha avtoto'lov mavjud emas.
                            </p>
                            <p className="text-blue-800 leading-relaxed">
                                Iltimos, quyidagi karta raqamiga <b className="text-blue-900 bg-blue-200/50 px-1 rounded">{(total() + deliveryPrice).toLocaleString()} so'm</b> o'tkazib,
                                chekni <a href={`https://t.me/${paymentInfo.phone.replace(/\+/g, '').replace(/\s/g, '')}`} className="underline font-bold hover:text-blue-600">{paymentInfo.phone}</a> raqamiga
                                Telegram orqali yuboring.
                            </p>
                            <button
                                type="button"
                                onClick={() => {
                                    navigator.clipboard.writeText(paymentInfo.card.replace(/\s/g, ''));
                                    toast.success("Karta raqami nusxalandi!");
                                }}
                                className="w-full bg-white/80 p-3 rounded-xl border border-blue-100 font-mono text-center font-bold text-lg text-slate-700 tracking-wider cursor-pointer active:scale-95 transition-all hover:bg-white flex items-center justify-center gap-2 group shadow-sm"
                            >
                                <span>{paymentInfo.card}</span>
                                <Copy className="w-4 h-4 text-blue-400 group-hover:text-blue-600" />
                            </button>
                        </div>
                    )}
                </motion.div>

                {/* Order Summary */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="liquid-card p-5 space-y-3"
                >
                    <h2 className="font-bold text-gray-900">Buyurtma xulosasi</h2>
                    <div className="flex justify-between text-sm text-gray-600">
                        <span>Mahsulotlar</span>
                        <span>{total().toLocaleString()} so'm</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                        <span>Yetkazib berish</span>
                        <span>{deliveryPrice.toLocaleString()} so'm</span>
                    </div>
                    <div className="border-t pt-2 mt-2 flex justify-between font-bold text-gray-900 text-lg">
                        <span>Jami</span>
                        <span>{(total() + deliveryPrice).toLocaleString()} so'm</span>
                    </div>
                </motion.div>

                {/* Error Log */}
                {errorLog && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-red-500/10 p-4 rounded-2xl border border-red-500/20 backdrop-blur-md"
                    >
                        <h3 className="text-red-600 font-bold mb-1">Xatolik:</h3>
                        <pre className="text-red-500 text-sm whitespace-pre-wrap font-mono">{errorLog}</pre>
                    </motion.div>
                )}

                {/* Summary & Submit */}
                {/* Summary & Submit */}
                {!isInputFocused && (
                    <div className="fixed left-4 right-4 z-40" style={{ bottom: "calc(70px + env(safe-area-inset-bottom, 20px))" }}>
                        <div className="liquid-glass border-none !bg-black/80 !text-white p-4 rounded-[2rem] shadow-2xl flex items-center justify-between backdrop-blur-xl">
                            <div className="flex flex-col pl-2">
                                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Jami to'lov</p>
                                <p className="text-xl font-bold">{(total() + deliveryPrice).toLocaleString()} <span className="text-sm font-normal text-gray-400">so'm</span></p>
                            </div>
                            <Button
                                type="submit"
                                className="px-8 h-12 rounded-xl text-lg font-bold bg-white text-black hover:bg-gray-200 shadow-lg shadow-white/10 active:scale-95 transition-all"
                                isLoading={isSubmitting}
                            >
                                Tasdiqlash
                            </Button>
                        </div>
                    </div>
                )}
            </form>
        </div>
    );
}

// Add types for Telegram WebApp
declare global {
    interface Window {
        Telegram?: {
            WebApp?: {
                initDataUnsafe?: {
                    user?: {
                        first_name: string;
                        last_name?: string;
                        username?: string;
                    }
                };
                HapticFeedback?: {
                    notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
                };
                BackButton?: {
                    show: () => void;
                    hide: () => void;
                    onClick: (cb: () => void) => void;
                }
            }
        }
    }
}
