import { useState, useEffect } from "react";
import { useCartStore } from "@/lib/store";
import { api } from "@/lib/api";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, MapPin, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export function CheckoutPage() {
    const { items, total, clearCart } = useCartStore();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingLocation, setIsLoadingLocation] = useState(false);
    const [errorLog, setErrorLog] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: "",
        phone: "+998",
        address: "",
        comment: "",
        paymentType: "CASH",
        location: ""
    });

    useEffect(() => {
        if (items.length === 0) {
            navigate("/");
        }

        // Autofill from AuthContext
        if (user) {
            setFormData(prev => ({
                ...prev,
                name: user.fullName || user.username || prev.name,
                phone: user.phone || prev.phone
            }));
        } else if (window.Telegram?.WebApp?.initDataUnsafe?.user) {
            // Fallback to Telegram Data if not logged in (though AuthProvider should handle this)
            const tgUser = window.Telegram.WebApp.initDataUnsafe.user;
            setFormData(prev => ({
                ...prev,
                name: `${tgUser.first_name} ${tgUser.last_name || ""}`.trim()
            }));
        }
    }, [items, navigate, user]);

    const handleLocation = () => {
        setIsLoadingLocation(true);
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const loc = `${position.coords.latitude},${position.coords.longitude}`;
                    setFormData(prev => ({ ...prev, location: loc }));
                    setIsLoadingLocation(false);
                    // Reverse geocoding could go here to fill address
                    // For now, just show coordinates or a success message
                    alert("Joylashuv aniqlandi!");
                },
                (error) => {
                    console.error(error);
                    alert("Joylashuvni aniqlab bo'lmadi. Iltimos manzilni o'zingiz kiriting.");
                    setIsLoadingLocation(false);
                }
            );
        } else {
            alert("Sizning brauzeringizda joylashuvni aniqlash imkoni yo'q");
            setIsLoadingLocation(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name || !formData.phone || !formData.address) {
            alert("Iltimos, barcha majburiy maydonlarni to'ldiring");
            return;
        }

        setIsSubmitting(true);
        try {
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
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="bg-white px-4 py-3 shadow-sm sticky top-0 z-10 flex items-center gap-4">
                <button onClick={() => navigate(-1)} className="text-gray-600 hover:text-black">
                    <ArrowLeft className="h-6 w-6" />
                </button>
                <h1 className="text-lg font-bold">Buyurtmani rasmiylashtirish</h1>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-6">

                {/* Contact Info */}
                <div className="bg-white p-4 rounded-xl shadow-sm space-y-4">
                    <h2 className="font-semibold text-gray-900">Aloqa ma'lumotlari</h2>
                    <div className="space-y-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Ism *</label>
                            <input
                                required
                                className="w-full px-4 py-3 rounded-lg bg-gray-50 border-transparent focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                                placeholder="Ismingiz"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Telefon *</label>
                            <input
                                type="tel"
                                required
                                className="w-full px-4 py-3 rounded-lg bg-gray-50 border-transparent focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                                placeholder="+998 90 123 45 67"
                                value={formData.phone}
                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </div>
                    </div>
                </div>

                {/* Delivery Info */}
                <div className="bg-white p-4 rounded-xl shadow-sm space-y-4">
                    <h2 className="font-semibold text-gray-900">Yetkazib berish</h2>
                    <div className="space-y-3">
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full h-12 gap-2 text-primary border-primary/20 bg-primary/5 hover:bg-primary/10"
                            onClick={handleLocation}
                            disabled={isLoadingLocation}
                        >
                            {isLoadingLocation ? <Loader2 className="h-5 w-5 animate-spin" /> : <MapPin className="h-5 w-5" />}
                            {formData.location ? "Joylashuv aniqlandi ✓" : "Mening joylashuvim"}
                        </Button>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Manzil (Mo'ljal) *</label>
                            <textarea
                                required
                                className="w-full px-4 py-3 rounded-lg bg-gray-50 border-transparent focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all outline-none min-h-[80px]"
                                placeholder="Chilonzor 1-mavze, 12-uy..."
                                value={formData.address}
                                onChange={e => setFormData({ ...formData, address: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Izoh (ixtiyoriy)</label>
                            <input
                                className="w-full px-4 py-3 rounded-lg bg-gray-50 border-transparent focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                                placeholder="Domofon kodi, eshik raqami..."
                                value={formData.comment}
                                onChange={e => setFormData({ ...formData, comment: e.target.value })}
                            />
                        </div>
                    </div>
                </div>

                {/* Payment */}
                <div className="bg-white p-4 rounded-xl shadow-sm space-y-4">
                    <h2 className="font-semibold text-gray-900">To'lov turi</h2>
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            type="button"
                            onClick={() => setFormData({ ...formData, paymentType: 'CASH' })}
                            className={`p-3 rounded-xl border font-medium transition-all ${formData.paymentType === 'CASH'
                                ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
                                : 'bg-gray-50 text-gray-600 border-transparent hover:bg-gray-100'
                                }`}
                        >
                            Naqd
                        </button>
                        <button
                            type="button"
                            onClick={() => setFormData({ ...formData, paymentType: 'card' })}
                            className={`p-3 rounded-xl border font-medium transition-all ${formData.paymentType === 'card'
                                ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
                                : 'bg-gray-50 text-gray-600 border-transparent hover:bg-gray-100'
                                }`}
                        >
                            Karta (Click/Payme)
                        </button>
                    </div>
                </div>

                {/* Error Log */}
                {errorLog && (
                    <div className="bg-red-50 p-4 rounded-xl border border-red-200">
                        <h3 className="text-red-800 font-bold mb-1">Xatolik:</h3>
                        <pre className="text-red-600 text-sm whitespace-pre-wrap font-mono">{errorLog}</pre>
                    </div>
                )}

                {/* Summary & Submit */}
                <div className="fixed bottom-20 left-0 right-0 p-4 bg-white border-t border-b z-40 pb-6">
                    <div className="container max-w-[600px] mx-auto flex items-center gap-4">
                        <div className="flex-1">
                            <p className="text-sm text-gray-500">Jami to'lov</p>
                            <p className="text-xl font-bold text-gray-900">{total().toLocaleString()} so'm</p>
                        </div>
                        <Button type="submit" className="px-8 h-12 text-lg font-bold shadow-xl shadow-primary/30" isLoading={isSubmitting}>
                            Tasdiqlash
                        </Button>
                    </div>
                </div>

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
