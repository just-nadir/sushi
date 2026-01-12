import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { socket, Order } from "@/lib/socket";
import { toast } from "sonner";
import { Eye, Printer, MapPin, Phone, User, Clock, XCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const statusColors: Record<string, string> = {
    NEW: "bg-blue-100 text-blue-700",
    KITCHEN: "bg-orange-100 text-orange-700",
    READY: "bg-purple-100 text-purple-700",
    DELIVERY: "bg-indigo-100 text-indigo-700",
    COMPLETED: "bg-green-100 text-green-700",
    CANCELLED: "bg-red-100 text-red-700"
};

const statusLabels: Record<string, string> = {
    NEW: "Yangi",
    KITCHEN: "Oshxonada",
    READY: "Tayyor",
    DELIVERY: "Yetkazilmoqda",
    COMPLETED: "Tugatildi",
    CANCELLED: "Bekor qilindi"
};

export function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [filter, setFilter] = useState("ALL");
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);

    useEffect(() => {
        loadOrders();

        socket.on("newOrder", (order: Order) => {
            setOrders(prev => [order, ...prev]);
            toast.info(`Yangi buyurtma: #${order.id}`);
        });

        socket.on("orderStatusChanged", (updatedOrder: Order) => {
            setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
        });

        return () => {
            socket.off("newOrder");
            socket.off("orderStatusChanged");
        };
    }, []);

    const loadOrders = async () => {
        try {
            const res = await api.get("/orders");
            const data = Array.isArray(res.data) ? res.data : (res.data.data || []);
            // Sort by most recent
            setOrders(data.sort((a: Order, b: Order) => b.id - a.id));
        } catch (error) {
            console.error("Orders load failed", error);
            toast.error("Buyurtmalarni yuklashda xatolik");
        }
    };

    const updateStatus = async (id: number, status: string) => {
        try {
            await api.patch(`/orders/${id}`, { status });
            toast.success("Status o'zgartirildi");
            if (selectedOrder && selectedOrder.id === id) {
                setSelectedOrder(prev => prev ? { ...prev, status } : null);
            }
        } catch (error) {
            console.error(error);
            toast.error("Xatolik");
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const filteredOrders = filter === "ALL"
        ? orders
        : orders.filter(o => o.status === filter);

    return (
        <div className="p-8 h-full flex flex-col gap-6">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Buyurtmalar</h1>

            {/* Filters */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {["ALL", "NEW", "KITCHEN", "READY", "DELIVERY", "COMPLETED", "CANCELLED"].map(status => (
                    <button
                        key={status}
                        onClick={() => setFilter(status)}
                        className={cn(
                            "px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap border",
                            filter === status
                                ? "bg-primary text-white border-primary"
                                : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                        )}
                    >
                        {status === "ALL" ? "Barchasi" : statusLabels[status]}
                    </button>
                ))}
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border shadow-sm overflow-hidden flex-1 flex flex-col">
                <div className="overflow-auto flex-1">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50/80 border-b sticky top-0 z-10 backdrop-blur-sm">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-gray-500">ID</th>
                                <th className="px-6 py-4 font-semibold text-gray-500">Mijoz</th>
                                <th className="px-6 py-4 font-semibold text-gray-500">Status</th>
                                <th className="px-6 py-4 font-semibold text-gray-500">To'lov</th>
                                <th className="px-6 py-4 font-semibold text-gray-500">Summa</th>
                                <th className="px-6 py-4 font-semibold text-gray-500">Vaqt</th>
                                <th className="px-6 py-4 font-semibold text-gray-500 text-right">Amallar</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredOrders.map((order) => (
                                <tr key={order.id} className="hover:bg-gray-50/50 transition-colors cursor-pointer" onClick={() => { setSelectedOrder(order); setIsDetailsOpen(true); }}>
                                    <td className="px-6 py-4 font-bold text-gray-900">#{order.id}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="font-medium text-gray-900">{order.customerName || "Mijoz"}</span>
                                            <span className="text-xs text-gray-500">{order.customerPhone}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={cn("px-2.5 py-1 rounded-full text-xs font-semibold", statusColors[order.status])}>
                                            {statusLabels[order.status]}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">{order.paymentType === 'CASH' ? 'Naqd' : 'Karta'}</td>
                                    <td className="px-6 py-4 font-medium text-gray-900">{Number(order.totalAmount).toLocaleString()} so'm</td>
                                    <td className="px-6 py-4 text-gray-500">
                                        {new Date(order.createdAt).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                                            <Eye className="h-4 w-4 text-blue-600" />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Order Details Modal */}
            {isDetailsOpen && selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in zoom-in-95 duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                                    Buyurtma #{selectedOrder.id}
                                    <span className={cn("px-3 py-1 rounded-full text-sm font-medium", statusColors[selectedOrder.status])}>
                                        {statusLabels[selectedOrder.status]}
                                    </span>
                                </h2>
                                <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                                    <Clock className="h-3.5 w-3.5" />
                                    {new Date(selectedOrder.createdAt).toLocaleString('uz-UZ')}
                                </p>
                            </div>
                            <button onClick={() => setIsDetailsOpen(false)} className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors">
                                <XCircle className="h-5 w-5 text-gray-600" />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="flex-1 overflow-y-auto p-6 md:flex gap-8 print-content">
                            {/* Left: Items */}
                            <div className="flex-1">
                                <h3 className="font-semibold text-gray-900 mb-4">Buyurtma Tarkibi</h3>
                                <div className="space-y-4">
                                    {selectedOrder.items.map((item: any) => (
                                        <div key={item.id} className="flex justify-between items-start pb-4 border-b border-dashed last:border-0 last:pb-0">
                                            <div>
                                                <p className="font-medium text-gray-800">
                                                    {item.product?.name || "Mahsulot"} <span className="text-gray-400">x {item.quantity}</span>
                                                </p>
                                                {/* <p className="text-xs text-gray-500">Qo'shimchalar yo'q</p> */}
                                            </div>
                                            <p className="font-medium text-gray-900">
                                                {(Number(item.price) * item.quantity).toLocaleString()} so'm
                                            </p>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-6 pt-4 border-t flex justify-between items-center">
                                    <span className="font-bold text-lg">Jami</span>
                                    <span className="font-bold text-xl text-primary">{Number(selectedOrder.totalAmount).toLocaleString()} so'm</span>
                                </div>
                            </div>

                            {/* Right: Customer & Actions */}
                            <div className="md:w-64 space-y-6 mt-6 md:mt-0 print:hidden">
                                <div className="bg-gray-50 p-4 rounded-xl space-y-3">
                                    <h3 className="font-semibold text-gray-900">Mijoz Ma'lumotlari</h3>
                                    <div className="flex items-center gap-3 text-sm text-gray-600">
                                        <User className="h-4 w-4" />
                                        <span>{selectedOrder.customerName || "Noma'lum"}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-gray-600">
                                        <Phone className="h-4 w-4" />
                                        <a href={`tel:${selectedOrder.customerPhone}`} className="hover:text-primary hover:underline">{selectedOrder.customerPhone}</a>
                                    </div>
                                    <div className="flex items-start gap-3 text-sm text-gray-600">
                                        <MapPin className="h-4 w-4 mt-0.5" />
                                        <span>{selectedOrder.address || "Manzil ko'rsatilmagan"}</span>
                                    </div>
                                    {selectedOrder.location && (
                                        <a
                                            href={`https://yandex.uz/maps/?pt=${selectedOrder.location.split(',')[1]},${selectedOrder.location.split(',')[0]}&z=15&l=map`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="block w-full text-center py-2 bg-white border rounded-lg text-xs font-medium hover:bg-gray-100 transition-colors text-blue-600"
                                        >
                                            Xaritada ko'rish
                                        </a>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <h3 className="font-semibold text-gray-900">Statusni o'zgartirish</h3>
                                    <div className="grid grid-cols-2 gap-2">
                                        {selectedOrder.status === 'NEW' && (
                                            <Button onClick={() => updateStatus(selectedOrder.id, 'KITCHEN')} className="w-full bg-orange-500 hover:bg-orange-600 text-white">
                                                Oshxonaga
                                            </Button>
                                        )}
                                        {selectedOrder.status === 'KITCHEN' && (
                                            <Button onClick={() => updateStatus(selectedOrder.id, 'READY')} className="w-full bg-purple-500 hover:bg-purple-600 text-white">
                                                Tayyor
                                            </Button>
                                        )}
                                        {selectedOrder.status === 'READY' && (
                                            <Button onClick={() => updateStatus(selectedOrder.id, 'DELIVERY')} className="w-full bg-indigo-500 hover:bg-indigo-600 text-white">
                                                Kuryerga
                                            </Button>
                                        )}
                                        {selectedOrder.status === 'DELIVERY' && (
                                            <Button onClick={() => updateStatus(selectedOrder.id, 'COMPLETED')} className="w-full bg-green-500 hover:bg-green-600 text-white">
                                                Yetkazildi
                                            </Button>
                                        )}
                                        {['NEW', 'KITCHEN', 'READY'].includes(selectedOrder.status) && (
                                            <Button variant="destructive" onClick={() => updateStatus(selectedOrder.id, 'CANCELLED')} className="w-full col-span-2">
                                                Bekor qilish
                                            </Button>
                                        )}
                                    </div>
                                </div>

                                <Button variant="outline" className="w-full gap-2" onClick={handlePrint}>
                                    <Printer className="h-4 w-4" /> Chek chiqarish
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Print Styles */}
            <style>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    .print-content, .print-content * {
                        visibility: visible;
                    }
                    .print-content {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                    }
                    .print:hidden {
                        display: none !important;
                    }
                }
            `}</style>
        </div>
    );
}
