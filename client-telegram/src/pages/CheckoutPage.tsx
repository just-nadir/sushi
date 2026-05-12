import { useState, useEffect } from "react";
import { useCartStore } from "@/lib/store";
import { api } from "@/lib/api";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, User, CreditCard, Banknote, Copy, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/lib/auth.store";
import { useIsInputFocused } from "@/hooks/useIsInputFocused";

export function CheckoutPage() {
    const isInputFocused = useIsInputFocused();
    const { items, total, clearCart } = useCartStore();
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [isSubmitting, setIsSubmitting] = useState(false);

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
        }).catch(() => {});

        if (items.length === 0) navigate("/");

        if (user) {
            setFormData(prev => ({
                ...prev,
                name: user.fullName || prev.name,
                phone: user.phone || prev.phone
            }));
        } else if (window.Telegram?.WebApp?.initDataUnsafe?.user) {
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
            toast.error("Barcha majburiy maydonlarni to'ldiring");
            return;
        }

        setIsSubmitting(true);
        try {
            const statusRes = await api.get('/store/status');
            if (!statusRes.data.isOpen) {
                toast.error(statusRes.data.message);
                window.location.reload();
                return;
            }

            let locationLat = undefined;
            let locationLon = undefined;
            if (formData.location) {
                const [lat, lon] = formData.location.split(',').map(Number);
                locationLat = lat;
                locationLon = lon;
            }

            await api.post('/orders', {
                items: items.map(i => ({ productId: i.id, quantity: i.quantity })),
                customerName: formData.name,
                customerPhone: formData.phone,
                address: formData.address,
                comment: formData.comment,
                paymentType: formData.paymentType,
                type: 'DELIVERY',
                locationLat,
                locationLon
            });

            clearCart();
            localStorage.setItem('user-phone', formData.phone);

            if (window.Telegram?.WebApp?.HapticFeedback) {
                window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
            }

            toast.success("Buyurtmangiz qabul qilindi! 🎉");
            navigate('/history');
        } catch (error: any) {
            if (window.Telegram?.WebApp?.HapticFeedback) {
                window.Telegram.WebApp.HapticFeedback.notificationOccurred('error');
            }
            const msg = error.response?.data?.message;
            toast.error(Array.isArray(msg) ? msg.join(', ') : msg || "Xatolik yuz berdi");
        } finally {
            setIsSubmitting(false);
        }
    };

    const grandTotal = total() + deliveryPrice;

    return (
        <div className="min-h-screen pb-36">
            {/* Header */}
            <div className="sticky top-0 z-20 bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3">
                <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                    <ArrowLeft className="w-5 h-5 text-gray-700" />
                </button>
                <h1 className="text-xl font-bold text-gray-900">Rasmiylashtirish</h1>
            </div>

            <form onSubmit={handleSubmit} className="px-4 pt-4 space-y-4">
                {/* Contact */}
                <section className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
                    <div className="flex items-center gap-2 mb-1">
                        <User className="w-4 h-4 text-primary" />
                        <h2 className="font-semibold text-gray-900 text-sm">Aloqa ma'lumotlari</h2>
                    </div>
                    <input
                        required
                        placeholder="Ismingiz"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        className="w-full h-12 px-4 bg-gray-50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/30 border border-gray-100"
                    />
                    <input
                        type="tel"
                        required
                        placeholder="+998 90 123 45 67"
                        value={formData.phone}
                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full h-12 px-4 bg-gray-50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/30 border border-gray-100"
                    />
                </section>

                {/* Delivery */}
                <section className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
                    <div className="flex items-center gap-2 mb-1">
                        <MapPin className="w-4 h-4 text-orange-500" />
                        <h2 className="font-semibold text-gray-900 text-sm">Yetkazib berish</h2>
                    </div>
                    <textarea
                        required
                        placeholder="Manzilingizni to'liq kiriting"
                        value={formData.address}
                        onChange={e => setFormData({ ...formData, address: e.target.value })}
                        className="w-full min-h-[80px] px-4 py-3 bg-gray-50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/30 border border-gray-100 resize-none"
                    />
                    <input
                        placeholder="Izoh: domofon kodi, eshik raqami..."
                        value={formData.comment}
                        onChange={e => setFormData({ ...formData, comment: e.target.value })}
                        className="w-full h-12 px-4 bg-gray-50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/30 border border-gray-100"
                    />
                </section>

                {/* Payment */}
                <section className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
                    <div className="flex items-center gap-2 mb-1">
                        <CreditCard className="w-4 h-4 text-green-600" />
                        <h2 className="font-semibold text-gray-900 text-sm">To'lov turi</h2>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            type="button"
                            onClick={() => setFormData({ ...formData, paymentType: 'CASH' })}
                            className={`p-3 rounded-xl border-2 transition-all flex items-center justify-center gap-2 ${
                                formData.paymentType === 'CASH'
                                    ? 'border-primary bg-primary/5 text-primary'
                                    : 'border-gray-100 text-gray-600'
                            }`}
                        >
                            <Banknote className="w-5 h-5" />
                            <span className="font-semibold text-sm">Naqd</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setFormData({ ...formData, paymentType: 'card' })}
                            className={`p-3 rounded-xl border-2 transition-all flex items-center justify-center gap-2 ${
                                formData.paymentType === 'card'
                                    ? 'border-primary bg-primary/5 text-primary'
                                    : 'border-gray-100 text-gray-600'
                            }`}
                        >
                            <CreditCard className="w-5 h-5" />
                            <span className="font-semibold text-sm">Karta</span>
                        </button>
                    </div>

                    {formData.paymentType === 'card' && (
                        <div className="bg-blue-50 rounded-xl p-3 space-y-2 border border-blue-100">
                            <p className="text-xs text-blue-800">
                                Quyidagi kartaga <b>{grandTotal.toLocaleString()} so'm</b> o'tkazing va chekni{" "}
                                <a href={`https://t.me/${paymentInfo.phone.replace(/[+\s]/g, '')}`} className="underline font-bold">
                                    {paymentInfo.phone}
                                </a>{" "}
                                ga yuboring.
                            </p>
                            <button
                                type="button"
                                onClick={() => {
                                    navigator.clipboard.writeText(paymentInfo.card.replace(/\s/g, ''));
                                    toast.success("Nusxalandi!");
                                }}
                                className="w-full bg-white p-3 rounded-lg border border-blue-200 font-mono text-center font-bold text-base text-gray-800 flex items-center justify-center gap-2 active:scale-95 transition-transform"
                            >
                                {paymentInfo.card}
                                <Copy className="w-4 h-4 text-blue-500" />
                            </button>
                        </div>
                    )}
                </section>

                {/* Summary */}
                <section className="bg-white rounded-2xl border border-gray-100 p-4 space-y-2">
                    <div className="flex justify-between text-sm text-gray-600">
                        <span>Mahsulotlar ({items.reduce((a, b) => a + b.quantity, 0)} dona)</span>
                        <span>{total().toLocaleString()} so'm</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                        <span>Yetkazib berish</span>
                        <span>{deliveryPrice > 0 ? `${deliveryPrice.toLocaleString()} so'm` : "Bepul"}</span>
                    </div>
                    <div className="border-t border-gray-100 pt-2 flex justify-between">
                        <span className="font-bold text-gray-900">Jami</span>
                        <span className="font-bold text-lg text-gray-900">{grandTotal.toLocaleString()} so'm</span>
                    </div>
                </section>
            </form>

            {/* Submit Button */}
            {!isInputFocused && (
                <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-100 p-4 pb-safe">
                    <div className="max-w-md mx-auto flex items-center justify-between">
                        <div>
                            <p className="text-xs text-gray-500">Jami</p>
                            <p className="font-bold text-lg text-gray-900">{grandTotal.toLocaleString()} so'm</p>
                        </div>
                        <button
                            type="submit"
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="h-12 px-8 bg-primary text-white rounded-xl font-bold text-base active:scale-95 transition-transform shadow-sm disabled:opacity-50 flex items-center gap-2"
                        >
                            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                            Tasdiqlash
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

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
