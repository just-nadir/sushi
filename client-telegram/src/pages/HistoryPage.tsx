import { Clock, Package, Loader2, RotateCcw, ChevronDown, ChevronUp } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuthStore } from "@/lib/auth.store";
import { useEffect, useState } from "react";
import { socket } from "@/lib/socket";
import { useCartStore } from "@/lib/store";
import { useNavigate } from "react-router-dom";
import { OrderProgressBar } from "@/components/OrderProgressBar";
import { toast } from "sonner";

interface OrderItem {
    id: number;
    productId: string;
    quantity: number;
    price: number;
    product: { name: string };
}

interface Order {
    id: number;
    createdAt: string;
    status: 'NEW' | 'CONFIRMED' | 'COOKING' | 'KITCHEN' | 'READY' | 'DELIVERY' | 'COMPLETED' | 'DELIVERED' | 'CANCELLED';
    totalAmount: number;
    items: OrderItem[];
}

export function HistoryPage() {
    const { user } = useAuthStore();
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const { addToCart, clearCart } = useCartStore();
    const [expandedId, setExpandedId] = useState<number | null>(null);

    const userPhone = user?.phone || localStorage.getItem('user-phone');

    const { data: orders, isLoading } = useQuery<Order[]>({
        queryKey: ['my-orders', userPhone],
        queryFn: async () => {
            if (!userPhone) return [];
            const res = await api.get<Order[]>(`/orders?phone=${encodeURIComponent(userPhone)}`);
            return res.data;
        },
        enabled: !!userPhone
    });

    const [isConnected, setIsConnected] = useState(socket.connected);

    useEffect(() => {
        const onConnect = () => setIsConnected(true);
        const onDisconnect = () => setIsConnected(false);
        const onOrderUpdate = (updatedOrder: Order) => {
            queryClient.setQueryData(['my-orders', userPhone], (oldData: Order[] | undefined) => {
                if (!oldData) return oldData;
                return oldData.map(o => o.id === updatedOrder.id ? updatedOrder : o);
            });
            queryClient.invalidateQueries({ queryKey: ['my-orders'] });
        };

        socket.on('connect', onConnect);
        socket.on('disconnect', onDisconnect);
        socket.on('orderStatusChanged', onOrderUpdate);
        if (!socket.connected) socket.connect();

        return () => {
            socket.off('connect', onConnect);
            socket.off('disconnect', onDisconnect);
            socket.off('orderStatusChanged', onOrderUpdate);
        };
    }, [queryClient, userPhone]);

    const statusText: Record<string, string> = {
        NEW: "Qabul qilindi",
        CONFIRMED: "Tasdiqlandi",
        COOKING: "Tayyorlanmoqda",
        KITCHEN: "Oshxonada",
        READY: "Tayyor",
        DELIVERY: "Yetkazilmoqda",
        COMPLETED: "Yetkazildi",
        DELIVERED: "Yetkazildi",
        CANCELLED: "Bekor qilindi",
    };

    const statusDot: Record<string, string> = {
        NEW: "bg-blue-500",
        CONFIRMED: "bg-blue-500",
        COOKING: "bg-orange-500",
        READY: "bg-purple-500",
        DELIVERY: "bg-indigo-500",
        COMPLETED: "bg-green-500",
        DELIVERED: "bg-green-500",
        CANCELLED: "bg-red-500",
    };

    const isActive = (status: string) => !["COMPLETED", "DELIVERED", "CANCELLED"].includes(status);

    const handleReorder = (order: Order) => {
        clearCart();
        order.items.forEach(item => {
            for (let i = 0; i < item.quantity; i++) {
                addToCart({
                    id: item.productId,
                    name: item.product.name,
                    price: item.price,
                    description: "",
                    isAvailable: true,
                    categoryId: "",
                });
            }
        });
        toast.success("Savatchaga qo'shildi");
        navigate("/cart");
    };

    if (!userPhone) {
        return (
            <div className="flex flex-col items-center justify-center h-[80vh] gap-4 px-4 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                    <Clock className="w-8 h-8 text-gray-300" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">Buyurtmalar tarixi</h2>
                <p className="text-sm text-gray-500">Buyurtma berib, tarixni kuzating</p>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-[80vh]">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
        );
    }

    // Separate active and past orders
    const activeOrders = orders?.filter(o => isActive(o.status)) || [];
    const pastOrders = orders?.filter(o => !isActive(o.status)) || [];

    return (
        <div className="pb-24 min-h-screen">
            {/* Header */}
            <div className="sticky top-0 z-20 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
                <h1 className="text-xl font-bold text-gray-900">Buyurtmalarim</h1>
                <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-400'}`} />
                    <button
                        onClick={() => queryClient.invalidateQueries({ queryKey: ['my-orders'] })}
                        className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"
                    >
                        <Loader2 className={`h-4 w-4 text-gray-500 ${isLoading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            <div className="px-4 pt-4 space-y-6">
                {/* Active Orders */}
                {activeOrders.length > 0 && (
                    <div className="space-y-3">
                        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Faol buyurtmalar</h2>
                        {activeOrders.map((order) => (
                            <motion.div
                                key={order.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm"
                            >
                                <div className="flex items-center justify-between mb-1">
                                    <div className="flex items-center gap-2">
                                        <Package className="w-4 h-4 text-gray-400" />
                                        <span className="font-bold text-gray-900">#{order.id}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <div className={`w-2 h-2 rounded-full ${statusDot[order.status]} animate-pulse`} />
                                        <span className="text-xs font-medium text-gray-600">{statusText[order.status]}</span>
                                    </div>
                                </div>

                                <OrderProgressBar status={order.status} />

                                <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                                    <span className="text-sm text-gray-500">
                                        {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                    <span className="font-bold text-gray-900">{order.totalAmount.toLocaleString()} so'm</span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* Past Orders */}
                {pastOrders.length > 0 && (
                    <div className="space-y-3">
                        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Tarix</h2>
                        {pastOrders.map((order) => (
                            <div
                                key={order.id}
                                className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
                            >
                                <button
                                    onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
                                    className="w-full p-4 flex items-center justify-between"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-2 h-2 rounded-full ${statusDot[order.status]}`} />
                                        <div className="text-left">
                                            <span className="font-semibold text-sm text-gray-900">Buyurtma #{order.id}</span>
                                            <p className="text-xs text-gray-500">
                                                {new Date(order.createdAt).toLocaleDateString()} · {statusText[order.status]}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-sm text-gray-900">{order.totalAmount.toLocaleString()}</span>
                                        {expandedId === order.id ? (
                                            <ChevronUp className="w-4 h-4 text-gray-400" />
                                        ) : (
                                            <ChevronDown className="w-4 h-4 text-gray-400" />
                                        )}
                                    </div>
                                </button>

                                {expandedId === order.id && (
                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: "auto" }}
                                        className="border-t border-gray-50 px-4 pb-4"
                                    >
                                        <div className="pt-3 space-y-2">
                                            {order.items.map((item) => (
                                                <div key={item.id} className="flex justify-between text-sm">
                                                    <span className="text-gray-700">{item.product.name} × {item.quantity}</span>
                                                    <span className="text-gray-500">{(item.price * item.quantity).toLocaleString()}</span>
                                                </div>
                                            ))}
                                        </div>
                                        {["COMPLETED", "DELIVERED"].includes(order.status) && (
                                            <button
                                                onClick={() => handleReorder(order)}
                                                className="mt-3 w-full h-10 bg-primary/10 text-primary rounded-xl text-sm font-semibold flex items-center justify-center gap-2 active:scale-95 transition-transform"
                                            >
                                                <RotateCcw className="w-4 h-4" />
                                                Qayta buyurtma berish
                                            </button>
                                        )}
                                    </motion.div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {orders?.length === 0 && (
                    <div className="py-16 text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Clock className="w-8 h-8 text-gray-300" />
                        </div>
                        <p className="font-semibold text-gray-900">Buyurtmalar topilmadi</p>
                        <p className="text-sm text-gray-500 mt-1">Birinchi buyurtmangizni bering</p>
                    </div>
                )}
            </div>
        </div>
    );
}
