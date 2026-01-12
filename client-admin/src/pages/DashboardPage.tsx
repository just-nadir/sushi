import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Search } from "lucide-react";
import { socket, Order } from "@/lib/socket";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const chartData = [
    { name: 'Du', value: 400000 },
    { name: 'Se', value: 300000 },
    { name: 'Ch', value: 200000 },
    { name: 'Pa', value: 278000 },
    { name: 'Ju', value: 189000 },
    { name: 'Sh', value: 239000 },
    { name: 'Ya', value: 349000 },
];

// Order Card Component
function OrderCard({ order, onStatusChange }: { order: Order, onStatusChange: (id: number, status: string) => void }) {
    const statusColors: any = {
        NEW: "bg-blue-100 text-blue-700",
        PREPARING: "bg-yellow-100 text-yellow-700",
        READY: "bg-green-100 text-green-700",
        DELIVERY: "bg-purple-100 text-purple-700",
        COMPLETED: "bg-gray-100 text-gray-700",
        CANCELLED: "bg-red-100 text-red-700"
    };

    return (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-border/50 flex flex-col gap-3">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="font-bold text-lg">#{order.id}</h3>
                    <p className="text-muted-foreground text-xs">{new Date(order.createdAt).toLocaleTimeString()}</p>
                </div>
                <span className={`px-2 py-1 rounded-md text-xs font-bold ${statusColors[order.status] || "bg-gray-100"}`}>
                    {order.status}
                </span>
            </div>

            <div className="space-y-1">
                {order.items.map((item: any, i: number) => (
                    <div key={i} className="text-sm flex justify-between">
                        <span>{item.product?.name || "Mahsulot"} x {item.quantity}</span>
                        <span className="font-medium">{(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                ))}
                {order.comment && <p className="text-xs text-orange-600 bg-orange-50 p-1 rounded mt-1">Izoh: {order.comment}</p>}
            </div>

            <div className="pt-2 border-t mt-auto">
                <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-medium">Jami:</span>
                    <span className="font-bold text-lg">{order.totalAmount.toLocaleString()}</span>
                </div>

                <div className="flex gap-2">
                    {order.status === 'NEW' && (
                        <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700" onClick={() => onStatusChange(order.id, 'PREPARING')}>
                            Qabul qilish
                        </Button>
                    )}
                    {order.status === 'PREPARING' && (
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
        fetch('http://localhost:3000/orders')
            .then(res => res.json())
            .then((res: any) => {
                // Check if response is wrapped
                const ordersData = res.data || res;
                if (Array.isArray(ordersData)) {
                    setOrders(ordersData);
                } else {
                    console.error("Orders data is not an array:", ordersData);
                    setOrders([]);
                }
                // setIsLoading(false);
            })
            .catch(err => console.error(err));

        // 2. Socket Listeners
        socket.connect();

        socket.on('newOrder', (newOrder: Order) => {
            // Play sound?
            const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3'); // Notification sound
            audio.play().catch(e => console.log('Audio play failed', e));

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

            await fetch(`http://localhost:3000/orders/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });
        } catch (error) {
            console.error(error);
            // Revert if needed, but socket will usually fix it or refresh
        }
    };

    // const activeOrders = orders.filter(o => !['COMPLETED', 'CANCELLED'].includes(o.status));
    // const completedOrders = orders.filter(o => ['COMPLETED', 'CANCELLED'].includes(o.status));

    return (
        <div className="p-8 h-full overflow-hidden flex flex-col gap-6">
            {/* Header */}
            <div className="flex justify-between items-center flex-shrink-0">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Buyurtmalar</h1>
                    <p className="text-muted-foreground">Bugungi tushgan barcha buyurtmalar</p>
                </div>
                <div className="flex gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="ID yoki ism bo'yicha..."
                            className="pl-9 pr-4 py-2 rounded-lg border bg-background"
                        />
                    </div>
                    <Button variant="outline">Filtr</Button>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-3 gap-6 h-[300px]">
                {/* Revenue Overview */}
                <div className="col-span-2 bg-white rounded-xl shadow-sm border p-6 flex flex-col">
                    <h3 className="font-bold text-gray-700 mb-4">Sotuvlar Statistikasi (Haftalik)</h3>
                    <div className="flex-1 min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} tickFormatter={(val) => `${val / 1000}k`} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    formatter={(value: any) => [`${value.toLocaleString()} so'm`, 'Sotuv']}
                                />
                                <Area type="monotone" dataKey="value" stroke="#f97316" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Popular Products (Mock) */}
                <div className="bg-white rounded-xl shadow-sm border p-6">
                    <h3 className="font-bold text-gray-700 mb-4">Top Mahsulotlar</h3>
                    <div className="space-y-4">
                        {[1, 2, 3].map((_, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <div className="h-10 w-10 bg-gray-100 rounded-lg"></div>
                                <div className="flex-1">
                                    <div className="h-4 w-24 bg-gray-100 rounded mb-1"></div>
                                    <div className="h-3 w-12 bg-gray-100 rounded"></div>
                                </div>
                                <div className="font-bold text-sm">#{i + 1}</div>
                            </div>
                        ))}
                    </div>
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
                                {orders.filter(o => o.status === 'PREPARING').length}
                            </span>
                        </div>
                        <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin">
                            {orders.filter(o => o.status === 'PREPARING').map(order => (
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
