import { Clock, ChevronRight, Package, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuthStore } from "@/lib/auth.store";
import { useEffect } from "react";
import { socket } from "@/lib/socket";

interface OrderItem {
    id: number;
    productId: string;
    quantity: number;
    price: number;
    product: {
        name: string;
    };
}

interface Order {
    id: number;
    createdAt: string;
    status: 'NEW' | 'CONFIRMED' | 'COOKING' | 'READY' | 'DELIVERY' | 'COMPLETED' | 'CANCELLED';
    totalAmount: number;
    items: OrderItem[];
}

export function HistoryPage() {
    const { user } = useAuthStore();
    const queryClient = useQueryClient();

    // Prioritize auth user phone, fallback to local storage
    const userPhone = user?.phone || localStorage.getItem('user-phone');

    const { data: orders, isLoading } = useQuery<Order[]>({
        queryKey: ['my-orders', userPhone],
        queryFn: async () => {
            if (!userPhone) return [];

            // CLEANING PHONE NUMBER: Remove ALL non-digits (including +)
            // This ensures we search for "998901234567" which will match "+998901234567" or "998901234567" in DB via contains.
            const cleanPhone = userPhone.replace(/\D/g, '');

            const res = await api.get<Order[]>(`/orders?phone=${cleanPhone}`);
            return res.data;
        },
        enabled: !!userPhone
    });

    // Real-time updates
    useEffect(() => {
        socket.connect();

        socket.on('orderStatusChanged', (updatedOrder: Order) => {
            // Check if this order belongs to current user lists (optimization)
            // Or just invalidate all 'my-orders' queries
            console.log("Order updated:", updatedOrder);
            queryClient.invalidateQueries({ queryKey: ['my-orders'] });
        });

        return () => {
            socket.disconnect();
            socket.off('orderStatusChanged');
        };
    }, [queryClient]);

    const statusColors: Record<string, string> = {
        NEW: "bg-blue-100 text-blue-700",
        CONFIRMED: "bg-indigo-100 text-indigo-700",
        COOKING: "bg-yellow-100 text-yellow-700",
        READY: "bg-orange-100 text-orange-700",
        DELIVERY: "bg-purple-100 text-purple-700",
        COMPLETED: "bg-green-100 text-green-700",
        CANCELLED: "bg-red-100 text-red-700",
    };

    const statusText: Record<string, string> = {
        NEW: "Yangi",
        CONFIRMED: "Tasdiqlandi",
        COOKING: "Tayyorlanmoqda",
        READY: "Tayyor",
        DELIVERY: "Yetkazilmoqda",
        COMPLETED: "Yetkazildi",
        CANCELLED: "Bekor qilindi",
    };

    if (!userPhone) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] gap-4 text-center px-4">
                <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center">
                    <Clock className="h-8 w-8 text-gray-400" />
                </div>
                <h2 className="text-xl font-semibold">Buyurtmalar tarixi bo'sh</h2>
                <p className="text-muted-foreground">Siz hali hech narsa buyurtma qilmadingiz yoki telefon raqamingiz tizimda yo'q.</p>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-24 pt-4">
            <h1 className="text-2xl font-bold px-4">Buyurtmalarim</h1>

            {/* Debug Info (Temporary) */}
            <div className="px-4 text-xs text-gray-400">
                Tel: {userPhone} (Formatlangan: {userPhone.replace(/\D/g, '')})
            </div>

            <div className="space-y-3 px-4">
                {orders?.map((order, i) => (
                    <motion.div
                        key={order.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-white rounded-2xl p-4 shadow-sm border border-border/50 active:scale-[0.98] transition-transform"
                    >
                        <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-2">
                                <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center">
                                    <Package className="h-4 w-4 text-muted-foreground" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm">Buyurtma #{order.id}</h3>
                                    <p className="text-xs text-muted-foreground">
                                        {new Date(order.createdAt).toLocaleDateString()} {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>
                            <span className={`px-2 py-1 rounded-lg text-xs font-bold ${statusColors[order.status] || 'bg-gray-100'}`}>
                                {statusText[order.status] || order.status}
                            </span>
                        </div>

                        <div className="pl-10 space-y-1 mb-3">
                            {order.items.map((item) => (
                                <p key={item.id} className="text-sm text-foreground/80">
                                    {item.product.name} <span className="text-xs text-muted-foreground">x{item.quantity}</span>
                                </p>
                            ))}
                        </div>

                        <div className="flex items-center justify-between pl-10 pt-2 border-t">
                            <span className="font-bold">{order.totalAmount.toLocaleString()} so'm</span>
                            <button className="text-xs text-primary font-medium flex items-center gap-1">
                                Batafsil <ChevronRight className="h-3 w-3" />
                            </button>
                        </div>
                    </motion.div>
                ))}

                {orders?.length === 0 && (
                    <div className="text-center py-10 text-muted-foreground">
                        <Clock className="h-12 w-12 mx-auto mb-3 opacity-20" />
                        <p>Buyurtmalar tarixi topilmadi</p>
                        <p className="text-xs mt-2 text-gray-400">Yangi buyurtma berib ko'ring</p>
                    </div>
                )}
            </div>
        </div>
    );
}
