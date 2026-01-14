import { Clock, ChevronRight, Package, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuthStore } from "@/lib/auth.store";
import { useEffect, useState } from "react";
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

            // Send phone as-is to match the DB format (which might contain spaces)
            const res = await api.get<Order[]>(`/orders?phone=${encodeURIComponent(userPhone)}`);
            return res.data;
        },
        enabled: !!userPhone
    });

    // Real-time updates
    const [isConnected, setIsConnected] = useState(socket.connected);

    useEffect(() => {
        const onConnect = () => setIsConnected(true);
        const onDisconnect = () => setIsConnected(false);

        const onOrderUpdate = (updatedOrder: Order) => {
            console.log("🔥 SOCKET RECEIVED:", updatedOrder);

            // Direct cache update for immediate feedback
            queryClient.setQueryData(['my-orders', userPhone], (oldData: Order[] | undefined) => {
                if (!oldData) return oldData;
                return oldData.map(o => o.id === updatedOrder.id ? updatedOrder : o);
            });

            // Fallback invalidation
            queryClient.invalidateQueries({ queryKey: ['my-orders'] });
        };

        socket.on('connect', onConnect);
        socket.on('disconnect', onDisconnect);
        socket.on('orderStatusChanged', onOrderUpdate);

        if (!socket.connected) {
            socket.connect();
        }

        return () => {
            socket.off('connect', onConnect);
            socket.off('disconnect', onDisconnect);
            socket.off('orderStatusChanged', onOrderUpdate);
        };
    }, [queryClient]);

    const statusColors: Record<string, string> = {
        NEW: "bg-blue-500/10 text-blue-700 border-blue-500/20",
        CONFIRMED: "bg-indigo-500/10 text-indigo-700 border-indigo-500/20",
        COOKING: "bg-yellow-500/10 text-yellow-700 border-yellow-500/20",
        READY: "bg-orange-500/10 text-orange-700 border-orange-500/20",
        DELIVERY: "bg-purple-500/10 text-purple-700 border-purple-500/20",
        COMPLETED: "bg-green-500/10 text-green-700 border-green-500/20",
        CANCELLED: "bg-red-500/10 text-red-700 border-red-500/20",
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
                <div className="liquid-glass h-20 w-20 rounded-full flex items-center justify-center shadow-inner">
                    <Clock className="h-10 w-10 text-gray-400" />
                </div>
                <div>
                    <h2 className="text-xl font-semibold text-gray-900">Buyurtmalar tarixi bo'sh</h2>
                    <p className="text-gray-500 mt-2">Siz hali hech narsa buyurtma qilmadingiz yoki telefon raqamingiz tizimda yo'q.</p>
                </div>
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
            <div className="flex items-center justify-between px-4">
                <h1 className="text-2xl font-bold drop-shadow-sm">Buyurtmalarim</h1>
                <div className="flex items-center gap-2">
                    <div className={`h-2.5 w-2.5 rounded-full shadow-sm ring-2 ring-white/20 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                    <button
                        onClick={() => queryClient.invalidateQueries({ queryKey: ['my-orders'] })}
                        className="p-2 hover:bg-white/40 rounded-full transition-colors"
                    >
                        <Loader2 className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            <div className="space-y-4 px-4">
                {orders?.map((order, i) => (
                    <motion.div
                        key={order.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="liquid-card p-5"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-2xl bg-white/40 flex items-center justify-center shadow-sm border border-white/20">
                                    <Package className="h-5 w-5 text-gray-700" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-base text-gray-900">Buyurtma #{order.id}</h3>
                                    <p className="text-xs text-gray-500 font-medium">
                                        {new Date(order.createdAt).toLocaleDateString()} {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>
                            <span className={`px-3 py-1.5 rounded-xl text-xs font-bold border backdrop-blur-sm ${statusColors[order.status] || 'bg-gray-100'}`}>
                                {statusText[order.status] || order.status}
                            </span>
                        </div>

                        <div className="pl-[52px] space-y-2 mb-4">
                            {order.items.map((item) => (
                                <div key={item.id} className="flex items-center justify-between text-sm">
                                    <span className="text-gray-700 font-medium">{item.product.name}</span>
                                    <span className="text-xs text-gray-500 bg-white/40 px-2 py-0.5 rounded-md border border-white/20">x{item.quantity}</span>
                                </div>
                            ))}
                        </div>

                        <div className="flex items-center justify-between pl-[52px] pt-3 border-t border-gray-200/50">
                            <p className="flex flex-col">
                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Jami to'lov</span>
                                <span className="font-bold text-gray-900">{order.totalAmount.toLocaleString()} so'm</span>
                            </p>
                            <button className="text-xs text-white bg-primary shadow-lg shadow-primary/30 px-4 py-2 rounded-xl font-bold flex items-center gap-1 active:scale-95 transition-transform hover:bg-primary/90">
                                Batafsil <ChevronRight className="h-3 w-3" />
                            </button>
                        </div>
                    </motion.div>
                ))}

                {orders?.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-12 flex flex-col items-center gap-4"
                    >
                        <div className="liquid-glass h-24 w-24 rounded-full flex items-center justify-center">
                            <Clock className="h-12 w-12 text-gray-300" />
                        </div>
                        <div>
                            <p className="font-bold text-gray-900">Buyurtmalar tarixi topilmadi</p>
                            <p className="text-sm mt-1 text-gray-500">Yangi buyurtma berib ko'ring</p>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
