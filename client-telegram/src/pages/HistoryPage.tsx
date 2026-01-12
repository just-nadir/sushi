import { Clock, ChevronRight, Package, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

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
    status: 'NEW' | 'PREPARING' | 'DELIVERY' | 'COMPLETED' | 'CANCELLED';
    totalAmount: number;
    items: OrderItem[];
}

export function HistoryPage() {
    const userPhone = localStorage.getItem('user-phone');

    const { data: orders, isLoading } = useQuery<Order[]>({
        queryKey: ['my-orders', userPhone],
        queryFn: async () => {
            if (!userPhone) return [];
            const res = await api.get<Order[]>(`/orders?phone=${userPhone}`);
            return res.data;
        },
        enabled: !!userPhone
    });

    const statusColors: Record<string, string> = {
        NEW: "bg-blue-100 text-blue-700",
        COMPLETED: "bg-green-100 text-green-700",
        CANCELLED: "bg-red-100 text-red-700",
        DELIVERY: "bg-purple-100 text-purple-700",
        PREPARING: "bg-yellow-100 text-yellow-700"
    };

    const statusText: Record<string, string> = {
        NEW: "Yangi",
        COMPLETED: "Yetkazildi",
        CANCELLED: "Bekor qilindi",
        DELIVERY: "Yo'lda",
        PREPARING: "Tayyorlanmoqda"
    };

    if (!userPhone) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] gap-4 text-center px-4">
                <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center">
                    <Clock className="h-8 w-8 text-gray-400" />
                </div>
                <h2 className="text-xl font-semibold">Buyurtmalar tarixi bo'sh</h2>
                <p className="text-muted-foreground">Siz hali hech narsa buyurtma qilmadingiz yoki telefon raqamingiz tasdiqlanmagan.</p>
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
        <div className="space-y-6 pb-20">
            <h1 className="text-2xl font-bold px-2">Buyurtmalarim</h1>

            <div className="space-y-3">
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
                    </div>
                )}
            </div>
        </div>
    );
}
