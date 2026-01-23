import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { socket, Order } from "@/lib/socket";
import { api } from "@/lib/api";

// Order Card Component
import { Phone, MapPin, CreditCard, Wallet, User } from "lucide-react";

function OrderCard({ order, onStatusChange }: { order: Order, onStatusChange: (id: number, status: string) => void }) {
    const statusColors: any = {
        NEW: "bg-blue-100 text-blue-700",
        COOKING: "bg-yellow-100 text-yellow-700",
        READY: "bg-green-100 text-green-700",
        DELIVERY: "bg-purple-100 text-purple-700",
        COMPLETED: "bg-gray-100 text-gray-700",
        CANCELLED: "bg-red-100 text-red-700"
    };

    const statusLabels: any = {
        NEW: "Yangi",
        COOKING: "Tayyorlanmoqda",
        READY: "Tayyor",
        DELIVERY: "Yetkazilmoqda",
        COMPLETED: "Tamomlandi",
        CANCELLED: "Bekor qilindi"
    };

    const paymentLabels: any = {
        CASH: { label: "Naqd", icon: Wallet, color: "text-green-600 bg-green-50" },
        card: { label: "Karta", icon: CreditCard, color: "text-blue-600 bg-blue-50" },
        CLICK: { label: "Click", icon: CreditCard, color: "text-blue-600 bg-blue-50" },
        PAYME: { label: "Payme", icon: CreditCard, color: "text-blue-600 bg-blue-50" }
    };

    const PaymentIcon = paymentLabels[order.paymentType]?.icon || Wallet;

    return (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-border/50 flex flex-col gap-3">
            {/* Header: ID, Time, Status */}
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="font-bold text-lg">#{order.id}</h3>
                    <p className="text-muted-foreground text-xs">{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                <span className={`px-2 py-1 rounded-md text-xs font-bold ${statusColors[order.status] || "bg-gray-100"}`}>
                    {statusLabels[order.status] || order.status}
                </span>
            </div>

            {/* Customer Info */}
            <div className="bg-gray-50 rounded-lg p-2 space-y-1.5 text-sm">
                <div className="flex items-center gap-2 text-gray-700">
                    <User className="h-4 w-4 text-gray-400" />
                    <span className="font-medium truncate">{order.customerName || "Noma'lum mijoz"}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <a href={`tel:${order.customerPhone}`} className="hover:text-primary transition-colors">
                        {order.customerPhone || "Raqam yo'q"}
                    </a>
                </div>
                {order.address && (
                    <div className="flex items-start gap-2 text-gray-700">
                        <MapPin className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                        <span className="leading-tight">{order.address}</span>
                    </div>
                )}
            </div>

            {/* Payment & Items */}
            <div className="space-y-2">
                <div className={`flex items-center gap-2 px-2 py-1.5 rounded-lg w-fit text-xs font-bold ${paymentLabels[order.paymentType]?.color || "bg-gray-100"}`}>
                    <PaymentIcon className="h-3.5 w-3.5" />
                    <span>{paymentLabels[order.paymentType]?.label || order.paymentType}</span>
                </div>

                <div className="space-y-1 pt-1 border-t border-dashed">
                    {order.items.map((item: any, i: number) => (
                        <div key={i} className="text-sm flex justify-between">
                            <span className="text-gray-600">{item.product?.name || "Mahsulot"} <span className="text-gray-400 text-xs">x{item.quantity}</span></span>
                            <span className="font-medium">{(item.price * item.quantity).toLocaleString()}</span>
                        </div>
                    ))}
                    {order.comment && <p className="text-xs text-orange-600 bg-orange-50 p-2 rounded mt-1 border border-orange-100">💡 {order.comment}</p>}
                </div>
            </div>

            {/* Footer: Total & Actions */}
            <div className="pt-2 border-t mt-auto">
                <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-medium text-gray-500">Jami:</span>
                    <span className="font-bold text-lg">{order.totalAmount.toLocaleString()} <span className="text-xs text-gray-400 font-normal">so'm</span></span>
                </div>

                <div className="flex gap-2">
                    {order.status === 'NEW' && (
                        <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700" onClick={() => onStatusChange(order.id, 'COOKING')}>
                            Qabul qilish
                        </Button>
                    )}
                    {order.status === 'COOKING' && (
                        <Button size="sm" className="w-full bg-yellow-600 hover:bg-yellow-700" onClick={() => onStatusChange(order.id, 'READY')}>
                            Tayyor
                        </Button>
                    )}
                    {order.status === 'READY' && (
                        <Button size="sm" className="w-full bg-purple-600 hover:bg-purple-700" onClick={() => onStatusChange(order.id, 'DELIVERY')}>
                            Kuryerga
                        </Button>
                    )}
                    {order.status === 'DELIVERY' && (
                        <Button size="sm" className="w-full bg-green-600 hover:bg-green-700" onClick={() => onStatusChange(order.id, 'COMPLETED')}>
                            Yetkazildi
                        </Button>
                    )}
                </div>
            </div>
        </div>
    )
}

export function DashboardPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    // const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // 1. Initial Fetch
        api.get('/orders')
            .then(res => {
                const data = res.data || res;
                const ordersData = Array.isArray(data) ? data : (data.data || []);

                if (Array.isArray(ordersData)) {
                    setOrders(ordersData);
                } else {
                    console.error("Orders data is not an array:", ordersData);
                    setOrders([]);
                }
            })
            .catch(err => console.error(err));

        // 2. Socket Listeners
        socket.connect();

        socket.on('newOrder', (newOrder: Order) => {
            // Play sound
            try {
                const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
                audio.play().catch(e => console.log('Audio autplay blocked', e));
            } catch (error) {
                console.error("Audio error", error);
            }

            toast.success(`Yangi buyurtma! #${newOrder.id}`);
            setOrders(prev => [newOrder, ...prev]);
        });

        socket.on('orderStatusChanged', (updatedOrder: Order) => {
            setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
        });

        return () => {
            socket.disconnect();
            socket.off('newOrder');
            socket.off('orderStatusChanged');
        };
    }, []);

    const handleStatusChange = async (id: number, status: string) => {
        try {
            // Optimistic update
            setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));

            await api.patch(`/orders/${id}`, { status });
        } catch (error) {
            console.error(error);
            // Revert if needed, but socket will usually fix it or refresh
        }
    };

    // Store Status Logic
    const [storeMode, setStoreMode] = useState<string>('AUTO');
    const [statusMessage, setStatusMessage] = useState<string>('');

    useEffect(() => {
        // Fetch initial status
        api.get('/store/status').then(res => {
            const data = res.data;
            setStoreMode(data.mode);
            setStatusMessage(data.message);
        });
    }, []);

    const handleModeChange = async (mode: string) => {
        try {
            await api.patch('/settings/store_mode', { value: mode });
            setStoreMode(mode);

            // Refetch status to get updated message
            const res = await api.get('/store/status');
            setStatusMessage(res.data.message);

            toast.success(`Holat o'zgartirildi: ${mode}`);
        } catch (error) {
            toast.error("Xatolik yuz berdi");
        }
    };


    // const activeOrders = orders.filter(o => !['COMPLETED', 'CANCELLED'].includes(o.status));
    // const completedOrders = orders.filter(o => ['COMPLETED', 'CANCELLED'].includes(o.status));

    return (
        <div className="h-full overflow-hidden flex flex-col">


            {/* Kanban Board / Grid */}

            {/* Kanban Board / Grid */}

            {/* Store Status Toggle */}
            <div className="bg-white border-b px-8 py-4 flex items-center justify-between mb-4">
                <div>
                    <h2 className="text-lg font-bold text-gray-900">Do'kon Holati</h2>
                    <p className={`text-sm font-medium ${statusMessage.includes("yopiq") ? "text-red-600" : "text-green-600"}`}>
                        {statusMessage}
                    </p>
                </div>
                <div className="flex bg-gray-100 p-1 rounded-xl">
                    <button
                        onClick={() => handleModeChange('AUTO')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${storeMode === 'AUTO' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-900'}`}
                    >
                        Avto
                    </button>
                    <button
                        onClick={() => handleModeChange('OPEN')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${storeMode === 'OPEN' ? 'bg-green-500 shadow-sm text-white' : 'text-gray-500 hover:text-green-600'}`}
                    >
                        Ochiq
                    </button>
                    <button
                        onClick={() => handleModeChange('CLOSED')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${storeMode === 'CLOSED' ? 'bg-red-500 shadow-sm text-white' : 'text-gray-500 hover:text-red-600'}`}
                    >
                        Yopiq
                    </button>
                </div>
            </div>

            {/* Kanban Board / Grid */}
            <div className="flex-1 overflow-x-auto overflow-y-hidden pt-2">
                <div className="grid grid-cols-4 gap-6 h-full min-w-[1000px]">
                    {/* Column 1: Yangi */}
                    <div className="flex flex-col gap-4 bg-secondary/30 p-4 rounded-2xl h-full">
                        <div className="flex items-center justify-between">
                            <h3 className="font-bold text-slate-700">Yangi</h3>
                            <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs font-bold">
                                {orders.filter(o => o.status === 'NEW').length}
                            </span>
                        </div>
                        <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin">
                            {orders.filter(o => o.status === 'NEW').map(order => (
                                <OrderCard key={order.id} order={order} onStatusChange={handleStatusChange} />
                            ))}
                        </div>
                    </div>

                    {/* Column 2: Tayyorlanmoqda */}
                    <div className="flex flex-col gap-4 bg-secondary/30 p-4 rounded-2xl h-full">
                        <div className="flex items-center justify-between">
                            <h3 className="font-bold text-slate-700">Tayyorlanmoqda</h3>
                            <span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full text-xs font-bold">
                                {orders.filter(o => o.status === 'COOKING').length}
                            </span>
                        </div>
                        <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin">
                            {orders.filter(o => o.status === 'COOKING').map(order => (
                                <OrderCard key={order.id} order={order} onStatusChange={handleStatusChange} />
                            ))}
                        </div>
                    </div>

                    {/* Column 3: Tayyor & Kuryerda */}
                    <div className="flex flex-col gap-4 bg-secondary/30 p-4 rounded-2xl h-full">
                        <div className="flex items-center justify-between">
                            <h3 className="font-bold text-slate-700">Yetkazishda</h3>
                            <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full text-xs font-bold">
                                {orders.filter(o => ['READY', 'DELIVERY'].includes(o.status)).length}
                            </span>
                        </div>
                        <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin">
                            {orders.filter(o => ['READY', 'DELIVERY'].includes(o.status)).map(order => (
                                <OrderCard key={order.id} order={order} onStatusChange={handleStatusChange} />
                            ))}
                        </div>
                    </div>

                    {/* Column 4: Tugatilgan */}
                    <div className="flex flex-col gap-4 bg-secondary/30 p-4 rounded-2xl h-full">
                        <div className="flex items-center justify-between">
                            <h3 className="font-bold text-slate-700">Tamomlangan</h3>
                            <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full text-xs font-bold">
                                {orders.filter(o => ['COMPLETED', 'CANCELLED'].includes(o.status)).length}
                            </span>
                        </div>
                        <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin">
                            {orders.filter(o => ['COMPLETED', 'CANCELLED'].includes(o.status)).map(order => (
                                <OrderCard key={order.id} order={order} onStatusChange={handleStatusChange} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
