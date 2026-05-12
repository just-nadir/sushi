import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuthStore } from "@/lib/auth.store";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChefHat, Truck, Package, Clock, ChevronRight } from "lucide-react";
import { useEffect } from "react";
import { socket } from "@/lib/socket";

interface Order {
    id: number;
    status: string;
    totalAmount: number;
    createdAt: string;
}

const activeStatuses = ["NEW", "CONFIRMED", "COOKING", "READY", "DELIVERY"];

const statusConfig: Record<string, { icon: typeof Clock; label: string; color: string }> = {
    NEW: { icon: Clock, label: "Qabul qilindi", color: "bg-blue-500" },
    CONFIRMED: { icon: Clock, label: "Tasdiqlandi", color: "bg-blue-500" },
    COOKING: { icon: ChefHat, label: "Tayyorlanmoqda", color: "bg-orange-500" },
    READY: { icon: Package, label: "Tayyor", color: "bg-purple-500" },
    DELIVERY: { icon: Truck, label: "Yetkazilmoqda", color: "bg-indigo-500" },
};

export function ActiveOrderBanner() {
    const { user } = useAuthStore();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const userPhone = user?.phone || localStorage.getItem("user-phone");

    const { data: orders } = useQuery<Order[]>({
        queryKey: ["my-orders", userPhone],
        queryFn: async () => {
            if (!userPhone) return [];
            const res = await api.get<Order[]>(`/orders?phone=${encodeURIComponent(userPhone)}`);
            return res.data;
        },
        enabled: !!userPhone,
    });

    useEffect(() => {
        const onOrderUpdate = () => {
            queryClient.invalidateQueries({ queryKey: ["my-orders"] });
        };
        socket.on("orderStatusChanged", onOrderUpdate);
        if (!socket.connected) socket.connect();
        return () => { socket.off("orderStatusChanged", onOrderUpdate); };
    }, [queryClient]);

    const activeOrder = orders?.find(o => activeStatuses.includes(o.status));
    if (!activeOrder) return null;

    const config = statusConfig[activeOrder.status] || statusConfig.NEW;
    const Icon = config.icon;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="mb-2"
            >
                <button
                    onClick={() => navigate("/history")}
                    className="w-full bg-white rounded-2xl border border-gray-100 p-3.5 flex items-center gap-3 shadow-sm active:scale-[0.98] transition-transform"
                >
                    <div className={`w-10 h-10 rounded-xl ${config.color} flex items-center justify-center`}>
                        <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 text-left min-w-0">
                        <p className="font-semibold text-sm text-gray-900">Buyurtma #{activeOrder.id}</p>
                        <p className="text-xs text-gray-500">{config.label}</p>
                    </div>
                    <motion.div
                        animate={{ opacity: [1, 0.3, 1] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                        className={`w-2 h-2 rounded-full ${config.color}`}
                    />
                    <ChevronRight className="w-4 h-4 text-gray-300" />
                </button>
            </motion.div>
        </AnimatePresence>
    );
}
