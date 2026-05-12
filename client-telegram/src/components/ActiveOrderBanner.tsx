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

const statusConfig: Record<string, { icon: typeof Clock; label: string; color: string; bg: string }> = {
    NEW: { icon: Clock, label: "Qabul qilindi", color: "text-blue-700", bg: "bg-blue-500" },
    CONFIRMED: { icon: Clock, label: "Tasdiqlandi", color: "text-blue-700", bg: "bg-blue-500" },
    COOKING: { icon: ChefHat, label: "Tayyorlanmoqda", color: "text-orange-700", bg: "bg-orange-500" },
    READY: { icon: Package, label: "Tayyor", color: "text-purple-700", bg: "bg-purple-500" },
    DELIVERY: { icon: Truck, label: "Yetkazilmoqda", color: "text-indigo-700", bg: "bg-indigo-500" },
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

    // Listen for real-time updates
    useEffect(() => {
        const onOrderUpdate = () => {
            queryClient.invalidateQueries({ queryKey: ["my-orders"] });
        };

        socket.on("orderStatusChanged", onOrderUpdate);
        if (!socket.connected) socket.connect();

        return () => {
            socket.off("orderStatusChanged", onOrderUpdate);
        };
    }, [queryClient]);

    const activeOrder = orders?.find(o => activeStatuses.includes(o.status));

    if (!activeOrder) return null;

    const config = statusConfig[activeOrder.status] || statusConfig.NEW;
    const Icon = config.icon;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: -10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, y: -10, height: 0 }}
                className="mb-2"
            >
                <div
                    onClick={() => navigate("/history")}
                    className="liquid-card !p-3 cursor-pointer active:scale-[0.98] transition-transform border-l-4 border-l-primary"
                >
                    <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-xl ${config.bg} flex items-center justify-center shadow-sm`}>
                            <Icon className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-sm text-gray-900">Buyurtma #{activeOrder.id}</span>
                                <motion.div
                                    animate={{ opacity: [1, 0.4, 1] }}
                                    transition={{ repeat: Infinity, duration: 1.5 }}
                                    className={`h-2 w-2 rounded-full ${config.bg}`}
                                />
                            </div>
                            <p className={`text-xs font-medium ${config.color}`}>{config.label}</p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-gray-400 shrink-0" />
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
