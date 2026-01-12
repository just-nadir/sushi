import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Save, Store, Truck, Clock, Lock, Upload } from "lucide-react";

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

    const [passwordData, setPasswordData] = useState({
        current: "",
        new: "",
        confirm: ""
    });

    const handleSave = (section: string) => {
        // Mock save
        toast.success(`${section} muvaffaqiyatli saqlandi`);
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
