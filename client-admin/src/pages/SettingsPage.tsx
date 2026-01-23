import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Save, Store, Truck, Clock, Lock, Upload, CreditCard } from "lucide-react";
import {
    useSettingsControllerFindAll,
    useSettingsControllerFindTelegramUsers,
    useSettingsControllerUpdate
} from "@/lib/api/generated";
import { useQueryClient } from "@tanstack/react-query";

interface SettingsState {
    // Restaurant
    name: string;
    phone: string;
    address: string;
    description: string;
    // Payment
    card_number: string;
    admin_phone: string;
    admin_chat_id: string;
    // Delivery
    delivery_price: string;
    minOrder: string;
    avgTime: string;
}

export function SettingsPage() {
    const queryClient = useQueryClient();

    // Initial state directly from what we expect (empty strings, not mocks)
    const [formData, setFormData] = useState<SettingsState>({
        name: "",
        phone: "",
        address: "",
        description: "",
        card_number: "",
        admin_phone: "",
        admin_chat_id: "",
        delivery_price: "",
        minOrder: "",
        avgTime: ""
    });

    const [passwordData, setPasswordData] = useState({
        current: "",
        new: "",
        confirm: ""
    });

    // Queries
    const { data: settingsRaw, isLoading } = useSettingsControllerFindAll();
    const { data: telegramUsersRaw } = useSettingsControllerFindTelegramUsers();

    const telegramUsers = (((telegramUsersRaw?.data as any)?.data || []) as any[]);
    const settings = (((settingsRaw?.data as any)?.data || []) as any[]);

    // Mutation
    const updateMutation = useSettingsControllerUpdate();

    // Load settings into state
    useEffect(() => {
        if (settings.length > 0) {
            const nextData = { ...formData };
            settings.forEach((s: any) => {
                if (Object.prototype.hasOwnProperty.call(nextData, s.key)) {
                    // @ts-ignore
                    nextData[s.key] = s.value;
                }
            });
            setFormData(nextData);
        }
    }, [settings]); // Only re-run if settings array changes reference (fetched)

    const handleChange = (field: keyof SettingsState, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async (section: string) => {
        try {
            const promises = [];

            if (section === "Restoran") {
                promises.push(updateMutation.mutateAsync({ key: 'name', data: { value: formData.name } }));
                promises.push(updateMutation.mutateAsync({ key: 'phone', data: { value: formData.phone } }));
                promises.push(updateMutation.mutateAsync({ key: 'address', data: { value: formData.address } }));
                promises.push(updateMutation.mutateAsync({ key: 'description', data: { value: formData.description } }));
            }
            else if (section === "To'lov") {
                promises.push(updateMutation.mutateAsync({ key: 'card_number', data: { value: formData.card_number } }));
                promises.push(updateMutation.mutateAsync({ key: 'admin_phone', data: { value: formData.admin_phone } }));
                promises.push(updateMutation.mutateAsync({ key: 'admin_chat_id', data: { value: formData.admin_chat_id } }));
            }
            else if (section === "Yetkazib berish") {
                promises.push(updateMutation.mutateAsync({ key: 'delivery_price', data: { value: formData.delivery_price } }));
                promises.push(updateMutation.mutateAsync({ key: 'minOrder', data: { value: formData.minOrder } }));
                promises.push(updateMutation.mutateAsync({ key: 'avgTime', data: { value: formData.avgTime } }));
            }

            await Promise.all(promises);
            await queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
            toast.success("O'zgarishlar saqlandi");
        } catch (error) {
            console.error(error);
            toast.error("Saqlashda xatolik");
        }
    };

    if (isLoading) return <div className="p-8">Yuklanmoqda...</div>;

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
                        {/* Logo Upload Placeholder - Functional logic can be added later if needed */}
                        <div className="shrink-0 flex flex-col gap-3 items-center">
                            <div className="h-32 w-32 rounded-2xl bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center relative group cursor-pointer overflow-hidden">
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
                                    value={formData.name}
                                    onChange={e => handleChange('name', e.target.value)}
                                    placeholder="Restoran nomi"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Telefon Raqam</label>
                                <input
                                    className="w-full border rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                    value={formData.phone}
                                    onChange={e => handleChange('phone', e.target.value)}
                                    placeholder="+998..."
                                />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-sm font-medium text-gray-700">Manzil</label>
                                <textarea
                                    className="w-full border rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all min-h-[80px]"
                                    value={formData.address}
                                    onChange={e => handleChange('address', e.target.value)}
                                    placeholder="Manzilni kiriting"
                                />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-sm font-medium text-gray-700">Izoh (Mijozlar uchun)</label>
                                <textarea
                                    className="w-full border rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all min-h-[60px]"
                                    value={formData.description}
                                    onChange={e => handleChange('description', e.target.value)}
                                    placeholder="Qisqacha ta'rif"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t">
                        <Button onClick={() => handleSave("Restoran")} className="gap-2">
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
                            value={formData.card_number}
                            onChange={e => handleChange('card_number', e.target.value)}
                            placeholder="8600..."
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Chek yuborish uchun raqam</label>
                        <input
                            className="w-full border rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                            value={formData.admin_phone}
                            onChange={e => handleChange('admin_phone', e.target.value)}
                            placeholder="+998..."
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
                            value={formData.admin_chat_id}
                            onChange={e => handleChange('admin_chat_id', e.target.value)}
                        >
                            <option value="">-- Tanlang --</option>
                            {telegramUsers.map((user: any) => (
                                <option key={user.telegramId} value={user.telegramId}>
                                    {user.fullName} ({user.phone})
                                </option>
                            ))}
                        </select>
                        <p className="text-xs text-gray-500">
                            Botga ulangan foydalanuvchilar ro'yxati.
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
                            value={formData.delivery_price}
                            onChange={e => handleChange('delivery_price', e.target.value)}
                            placeholder="0"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Minimal Buyurtma</label>
                        <input
                            className="w-full border rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                            value={formData.minOrder}
                            onChange={e => handleChange('minOrder', e.target.value)}
                            placeholder="0"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">O'rtacha Vaqt (min)</label>
                        <div className="relative">
                            <Clock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                            <input
                                className="w-full border rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                value={formData.avgTime}
                                onChange={e => handleChange('avgTime', e.target.value)}
                                placeholder="Masalan: 45-60"
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

            {/* Security - Password (UI only for now, logic can be separate or added if needed) */}
            <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
                <div className="px-6 py-4 border-b bg-gray-50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Lock className="h-5 w-5 text-gray-500" />
                        <h2 className="text-lg font-semibold text-gray-900">Xavfsizlik</h2>
                    </div>
                </div>
                <div className="p-6 max-w-xl space-y-4">
                    <p className="text-sm text-muted-foreground">Parolni o'zgartirish hozircha ishlamaydi (loyiha doirasida emas).</p>
                </div>
            </div>
        </div>
    );
}
