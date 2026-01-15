import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Save, Store, Truck, Clock, Lock, Upload, CreditCard } from "lucide-react";
import { api } from "@/lib/api";

export function SettingsPage() {
    const [restaurantInfo, setRestaurantInfo] = useState({
        name: "Sushi Master",
        phone: "+998 90 123 45 67",
        address: "Toshkent sh, Chilonzor 1-kvartal",
        description: "Eng mazali sushi va rollar yetkazib berish xizmati"
    });

    const [deliveryInfo, setDeliveryInfo] = useState({
        price: "15000",
        minOrder: "50000",
        freeDeliveryFrom: "200000",
        avgTime: "45-60"
    });

    const [paymentInfo, setPaymentInfo] = useState({
        card_number: "8600 1234 5678 9012",
        admin_phone: "+998 90 123 45 67",
        admin_chat_id: ""
    });

    const [passwordData, setPasswordData] = useState({
        current: "",
        new: "",
        confirm: ""
    });

    const [telegramUsers, setTelegramUsers] = useState<any[]>([]);

    useEffect(() => {
        fetchSettings();
        fetchTelegramUsers();
    }, []);

    const fetchTelegramUsers = async () => {
        try {
            const res = await api.get('/settings/telegram-users');
            setTelegramUsers(res.data);
        } catch (error) {
            console.error("Failed to fetch telegram users", error);
        }
    };

    const fetchSettings = async () => {
        try {
            const res = await api.get('/settings');
            const settings = res.data;
            // Map array of {key, value} to our state objects
            // Map settings
            const paymentUpdates: any = {};
            const deliveryUpdates: any = {};

            settings.forEach((s: any) => {
                if (['card_number', 'admin_phone', 'admin_chat_id'].includes(s.key)) {
                    paymentUpdates[s.key] = s.value;
                }
                if (['delivery_price', 'minOrder', 'avgTime'].includes(s.key)) {
                    // map DB keys to state keys if different, but here they match mostly.
                    // 'delivery_price' -> 'price'
                    if (s.key === 'delivery_price') deliveryUpdates.price = s.value;
                    else deliveryUpdates[s.key] = s.value;
                }
            });

            if (Object.keys(paymentUpdates).length > 0) {
                setPaymentInfo(prev => ({ ...prev, ...paymentUpdates }));
            }
            if (Object.keys(deliveryUpdates).length > 0) {
                setDeliveryInfo(prev => ({ ...prev, ...deliveryUpdates }));
            }
        } catch (error) {
            console.error("Failed to fetch settings", error);
        }
    };

    const handleSave = async (section: string, _data?: any) => {
        try {
            if (section === "To'lov") {
                await api.patch('/settings/card_number', { value: paymentInfo.card_number });
                await api.patch('/settings/admin_phone', { value: paymentInfo.admin_phone });
                await api.patch('/settings/admin_chat_id', { value: paymentInfo.admin_chat_id });
            } else if (section === "Yetkazib berish") {
                await api.patch('/settings/delivery_price', { value: deliveryInfo.price });
                await api.patch('/settings/minOrder', { value: deliveryInfo.minOrder });
                await api.patch('/settings/avgTime', { value: deliveryInfo.avgTime });
            }
            toast.success(`${section} muvaffaqiyatli saqlandi`);
        } catch (error) {
            toast.error("Saqlashda xatolik yuz berdi");
        }
    };

    return (
        <div className="p-8 pb-20 space-y-8 max-w-5xl mx-auto">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Sozlamalar</h1>

            {/* Restaurant Info */}
            <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
                <div className="px-6 py-4 border-b bg-gray-50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Store className="h-5 w-5 text-gray-500" />
                        <h2 className="text-lg font-semibold text-gray-900">Restoran Ma'lumotlari</h2>
                    </div>
                </div>
                <div className="p-6 space-y-6">
                    <div className="flex items-start gap-8">
                        {/* Logo Upload */}
                        <div className="shrink-0 flex flex-col gap-3 items-center">
                            <div className="h-32 w-32 rounded-2xl bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center relative group cursor-pointer overflow-hidden">
                                <img src="/logo.png" alt="Logo" className="w-full h-full object-cover opacity-50 group-hover:opacity-100 transition-opacity" />
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 group-hover:text-primary transition-colors">
                                    <Upload className="h-8 w-8 mb-1" />
                                    <span className="text-xs font-medium">Yuklash</span>
                                </div>
                            </div>
                            <span className="text-xs text-gray-500">2MB gacha, PNG/JPG</span>
                        </div>

                        {/* Fields */}
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Restoran Nomi</label>
                                <input
                                    className="w-full border rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                    value={restaurantInfo.name}
                                    onChange={e => setRestaurantInfo({ ...restaurantInfo, name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Telefon Raqam</label>
                                <input
                                    className="w-full border rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                    value={restaurantInfo.phone}
                                    onChange={e => setRestaurantInfo({ ...restaurantInfo, phone: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-sm font-medium text-gray-700">Manzil</label>
                                <textarea
                                    className="w-full border rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all min-h-[80px]"
                                    value={restaurantInfo.address}
                                    onChange={e => setRestaurantInfo({ ...restaurantInfo, address: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t">
                        <Button onClick={() => handleSave("Ma'lumotlar")} className="gap-2">
                            <Save className="h-4 w-4" /> Saqlash
                        </Button>
                    </div>
                </div>
            </div>

            {/* Payment Settings */}
            <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
                <div className="px-6 py-4 border-b bg-gray-50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5 text-gray-500" />
                        <h2 className="text-lg font-semibold text-gray-900">To'lov Ma'lumotlari</h2>
                    </div>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Karta Raqami</label>
                        <input
                            className="w-full border rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all font-mono"
                            value={paymentInfo.card_number}
                            onChange={e => setPaymentInfo({ ...paymentInfo, card_number: e.target.value })}
                            placeholder="8600 1234 5678 9012"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Chek yuborish uchun raqam</label>
                        <input
                            className="w-full border rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                            value={paymentInfo.admin_phone}
                            onChange={e => setPaymentInfo({ ...paymentInfo, admin_phone: e.target.value })}
                            placeholder="+998 90 123 45 67"
                        />
                    </div>
                    <div className="md:col-span-2 space-y-2 pt-2 border-t">
                        <label className="text-sm font-medium text-gray-700 flex justify-between">
                            <span>Telegram ID (Buyurtma xabarlarini olish uchun)</span>
                            <span className="text-xs text-blue-600 cursor-pointer" onClick={() => toast.info("Ro'yxatda ismingiz chiqmasa, Botga /start bosing")}>
                                Ismingiz chiqmayaptimi?
                            </span>
                        </label>
                        <select
                            className="w-full border rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all bg-white"
                            value={paymentInfo.admin_chat_id}
                            onChange={e => setPaymentInfo({ ...paymentInfo, admin_chat_id: e.target.value })}
                        >
                            <option value="">-- Tanlang --</option>
                            {telegramUsers.map((user: any) => (
                                <option key={user.telegramId} value={user.telegramId}>
                                    {user.fullName} ({user.phone})
                                </option>
                            ))}
                        </select>
                        <p className="text-xs text-gray-500">
                            Xabarnoma yuboriladigan foydalanuvchini tanlang. Ro'yxatda ko'rinish uchun avval botga <b>/start</b> bosing.
                        </p>
                    </div>
                    <div className="md:col-span-2 flex justify-end pt-4 border-t mt-2">
                        <Button onClick={() => handleSave("To'lov")} className="gap-2">
                            <Save className="h-4 w-4" /> Saqlash
                        </Button>
                    </div>
                </div>
            </div>

            {/* Delivery Settings */}
            <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
                <div className="px-6 py-4 border-b bg-gray-50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Truck className="h-5 w-5 text-gray-500" />
                        <h2 className="text-lg font-semibold text-gray-900">Yetkazib Berish</h2>
                    </div>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Standart Narx (so'm)</label>
                        <input
                            className="w-full border rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                            value={deliveryInfo.price}
                            onChange={e => setDeliveryInfo({ ...deliveryInfo, price: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Minimal Buyurtma</label>
                        <input
                            className="w-full border rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                            value={deliveryInfo.minOrder}
                            onChange={e => setDeliveryInfo({ ...deliveryInfo, minOrder: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">O'rtacha Vaqt (min)</label>
                        <div className="relative">
                            <Clock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                            <input
                                className="w-full border rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                value={deliveryInfo.avgTime}
                                onChange={e => setDeliveryInfo({ ...deliveryInfo, avgTime: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="md:col-span-3 flex justify-end pt-4 border-t mt-2">
                        <Button onClick={() => handleSave("Yetkazib berish")} className="gap-2">
                            <Save className="h-4 w-4" /> Saqlash
                        </Button>
                    </div>
                </div>
            </div>

            {/* Security */}
            <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
                <div className="px-6 py-4 border-b bg-gray-50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Lock className="h-5 w-5 text-gray-500" />
                        <h2 className="text-lg font-semibold text-gray-900">Xavfsizlik</h2>
                    </div>
                </div>
                <div className="p-6 max-w-xl space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Joriy Parol</label>
                        <input type="password"
                            className="w-full border rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                            value={passwordData.current}
                            onChange={e => setPasswordData({ ...passwordData, current: e.target.value })}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Yangi Parol</label>
                            <input type="password"
                                className="w-full border rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                value={passwordData.new}
                                onChange={e => setPasswordData({ ...passwordData, new: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Tasdiqlash</label>
                            <input type="password"
                                className="w-full border rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                value={passwordData.confirm}
                                onChange={e => setPasswordData({ ...passwordData, confirm: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="flex justify-end pt-4">
                        <Button variant="outline" onClick={() => handleSave("Parol")} className="gap-2">
                            O'zgartirish
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
