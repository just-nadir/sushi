import { useEffect, useMemo } from "react";
import { Button } from "@/components/ui/Button";
import { socket, Order } from "@/lib/socket";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useOrdersControllerFindAll, getOrdersControllerFindAllQueryKey } from "@/lib/api/generated";
import { useQueryClient } from "@tanstack/react-query";

export function ReportsPage() {
    const queryClient = useQueryClient();

    const { data: ordersRaw } = useOrdersControllerFindAll({} as any);
    const orders = ((ordersRaw?.data || []) as unknown) as Order[];

    useEffect(() => {
        // Socket Listeners
        if (!socket.connected) {
            socket.connect();
        }

        const onNewOrder = (newOrder: Order) => {
            queryClient.setQueryData(getOrdersControllerFindAllQueryKey({} as any), (old: any) => {
                const oldData = old?.data || [];
                return { ...old, data: [newOrder, ...oldData] };
            });
            // Also invalidate to be sure
            queryClient.invalidateQueries({ queryKey: getOrdersControllerFindAllQueryKey({} as any) });
        };

        const onStatusChange = (updatedOrder: Order) => {
            queryClient.setQueryData(getOrdersControllerFindAllQueryKey({} as any), (old: any) => {
                const oldData = old?.data || [];
                return { ...old, data: oldData.map((o: Order) => o.id === updatedOrder.id ? updatedOrder : o) };
            });
        };

        socket.on('newOrder', onNewOrder);
        socket.on('orderStatusChanged', onStatusChange);

        return () => {
            socket.off('newOrder', onNewOrder);
            socket.off('orderStatusChanged', onStatusChange);
        };
    }, [queryClient]);

    // --- Analytics Calculations ---
    const { chartData, topProducts } = useMemo(() => {
        // 1. Chart Data (Weekly Sales)
        const salesByDay = new Array(7).fill(0);

        orders.forEach(order => {
            if (order.status !== 'CANCELLED') {
                const dayIndex = new Date(order.createdAt).getDay();
                salesByDay[dayIndex] += order.totalAmount;
            }
        });

        // Rotate so it starts from Monday (Du) if needed, or just standard Sun-Sat
        // Let's standard starts from Monday: Du(1), Se(2), ... Ya(0)
        const orderedDays = [
            { name: 'Du', value: salesByDay[1] },
            { name: 'Se', value: salesByDay[2] },
            { name: 'Ch', value: salesByDay[3] },
            { name: 'Pa', value: salesByDay[4] },
            { name: 'Ju', value: salesByDay[5] },
            { name: 'Sh', value: salesByDay[6] },
            { name: 'Ya', value: salesByDay[0] },
        ];

        // 2. Top Products
        const productStats: Record<string, number> = {};
        orders.forEach(order => {
            if (order.status !== 'CANCELLED') {
                order.items.forEach((item: any) => {
                    const name = item.product?.name || "Noma'lum";
                    productStats[name] = (productStats[name] || 0) + item.quantity;
                });
            }
        });

        const sortedProducts = Object.entries(productStats)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 3); // Top 3

        return { chartData: orderedDays, topProducts: sortedProducts };
    }, [orders]);


    return (
        <div className="p-8 h-full overflow-auto flex flex-col gap-6">
            {/* Header */}
            <div className="flex justify-between items-center flex-shrink-0">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Hisobotlar</h1>
                    <p className="text-muted-foreground">Sotuvlar va statistika</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" onClick={() => {
                        const csvContent = "data:text/csv;charset=utf-8,"
                            + "ID,Sana,Status,Jami Summa,Mijoz\n"
                            + orders.map(o => `${o.id},${o.createdAt},${o.status},${o.totalAmount},${o.customerName || ''}`).join("\n");
                        const encodedUri = encodeURI(csvContent);
                        const link = document.createElement("a");
                        link.setAttribute("href", encodedUri);
                        link.setAttribute("download", "buyurtmalar.csv");
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                    }}>Export CSV</Button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl border shadow-sm flex flex-col">
                    <span className="text-muted-foreground text-sm font-medium">Jami Tushum (Bugun)</span>
                    <span className="text-2xl font-bold mt-2">
                        {orders.reduce((acc, o) => {
                            const isToday = new Date(o.createdAt).toDateString() === new Date().toDateString();
                            return acc + (o.status !== 'CANCELLED' && isToday ? o.totalAmount : 0);
                        }, 0).toLocaleString()} <span className="text-sm font-normal text-gray-500">so'm</span>
                    </span>
                </div>
                <div className="bg-white p-4 rounded-xl border shadow-sm flex flex-col">
                    <span className="text-muted-foreground text-sm font-medium">Buyurtmalar</span>
                    <span className="text-2xl font-bold mt-2">{orders.length}</span>
                </div>
                <div className="bg-white p-4 rounded-xl border shadow-sm flex flex-col">
                    <span className="text-muted-foreground text-sm font-medium">O'rtacha Chek</span>
                    <span className="text-2xl font-bold mt-2">
                        {orders.length > 0
                            ? Math.round(orders.reduce((acc, o) => acc + (o.status !== 'CANCELLED' ? o.totalAmount : 0), 0) / orders.filter(o => o.status !== 'CANCELLED').length || 1).toLocaleString()
                            : 0} <span className="text-sm font-normal text-gray-500">so'm</span>
                    </span>
                </div>
                <div className="bg-white p-4 rounded-xl border shadow-sm flex flex-col">
                    <span className="text-muted-foreground text-sm font-medium">Faol Buyurtmalar</span>
                    <span className="text-2xl font-bold mt-2 text-blue-600">
                        {orders.filter(o => !['COMPLETED', 'CANCELLED'].includes(o.status)).length}
                    </span>
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

                {/* Popular Products */}
                <div className="bg-white rounded-xl shadow-sm border p-6">
                    <h3 className="font-bold text-gray-700 mb-4">Top Mahsulotlar</h3>
                    <div className="space-y-4">
                        {topProducts.length > 0 ? topProducts.map((p, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <div className="h-10 w-10 bg-gradient-to-tr from-gray-100 to-gray-200 rounded-lg flex items-center justify-center font-bold text-gray-400 text-xs">
                                    {i + 1}
                                </div>
                                <div className="flex-1">
                                    <div className="font-bold text-sm truncate">{p.name}</div>
                                    <div className="text-xs text-muted-foreground">{p.count} ta sotildi</div>
                                </div>
                            </div>
                        )) : (
                            <p className="text-sm text-muted-foreground">Ma'lumot yetarli emas</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
