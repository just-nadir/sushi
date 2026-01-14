import { Search, Plus, ShoppingBag, Minus } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { api, Category, Product } from "@/lib/api"
import { useState, useMemo } from "react"
import { useCartStore } from "@/lib/store"
import { motion, AnimatePresence } from "framer-motion"
import { useNavigate } from "react-router-dom"

export function HomePage() {
    const navigate = useNavigate();
    const { addToCart, items } = useCartStore();
    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");

    // Fetch Categories
    const { data: categories, isLoading: isCatLoading } = useQuery({
        queryKey: ['categories'],
        queryFn: async () => {
            const res = await api.get<Category[]>('/categories');
            return res.data;
        }
    });

    // Fetch Products
    const { data: products, isLoading: isProdLoading } = useQuery({
        queryKey: ['products'],
        queryFn: async () => {
            const res = await api.get<Product[]>('/products');
            return res.data;
        }
    });

    // Filter Products
    const filteredProducts = useMemo(() => products?.filter(p => {
        const matchesCategory = activeCategory ? p.categoryId === activeCategory : true;
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.description?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    }), [products, activeCategory, searchQuery]);

    const handleAddToCart = (product: Product) => {
        addToCart(product);
    };

    return (
        <div className="space-y-6 pb-24 min-h-screen">
            {/* Header / Search */}
            <div className="sticky top-0 z-40 bg-white/10 backdrop-blur-md pt-4 pb-2 px-4 -mx-4 border-b border-white/20 shadow-sm">
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-500" />
                    </div>
                    <input
                        type="text"
                        placeholder="Taom izlash..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white/20 border border-white/30 text-gray-800 placeholder:text-gray-500 backdrop-blur-sm outline-none focus:ring-2 focus:ring-primary/50 text-base transition-all shadow-inner"
                    />
                </div>
            </div>

            {/* Categories */}
            <div className="flex flex-nowrap gap-2.5 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide w-full touch-pan-x">
                <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setActiveCategory(null)}
                    className={`shrink-0 whitespace-nowrap px-5 py-2.5 rounded-2xl text-sm font-bold transition-all border backdrop-blur-md ${activeCategory === null
                        ? "bg-primary text-white border-primary shadow-lg shadow-primary/30"
                        : "bg-white/40 border-white/20 text-gray-700 hover:bg-white/50"
                        }`}
                >
                    Barchasi
                </motion.button>
                {isCatLoading ? (
                    [1, 2, 3].map(i => <div key={i} className="shrink-0 h-10 w-24 bg-white/20 rounded-2xl animate-pulse" />)
                ) : (
                    categories?.map((cat) => (
                        <motion.button
                            key={cat.id}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setActiveCategory(cat.id)}
                            className={`shrink-0 whitespace-nowrap px-5 py-2.5 rounded-2xl text-sm font-bold transition-all border backdrop-blur-md flex items-center gap-2 ${activeCategory === cat.id
                                ? "bg-primary text-white border-primary shadow-lg shadow-primary/30"
                                : "bg-white/40 border-white/20 text-gray-700 hover:bg-white/50"
                                }`}
                        >
                            {cat.image && <img src={cat.image.replace('http://localhost:3000', '')} className="w-5 h-5 rounded-md object-cover bg-white/20" />}
                            {cat.name}
                        </motion.button>
                    ))
                )}
            </div>

            {/* Products Header */}
            <div className="flex items-center justify-between px-1 pt-2">
                <h2 className="text-xl font-bold text-gray-900 bg-white/30 backdrop-blur-sm px-3 py-1 rounded-xl">Menyu</h2>
                <span className="text-xs font-medium text-gray-600 bg-white/40 backdrop-blur-sm px-2 py-1 rounded-lg border border-white/20">
                    {filteredProducts?.length || 0} taom
                </span>
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-2 gap-2 pb-4">
                <AnimatePresence mode="popLayout">
                    {isProdLoading ? (
                        [1, 2, 3, 4].map((item) => (
                            <div key={item} className="bg-white/20 rounded-[2rem] p-3 border border-white/20 h-64 shadow-sm animate-pulse" />
                        ))
                    ) : (
                        (filteredProducts || []).length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="col-span-2 py-12 flex flex-col items-center text-center space-y-4"
                            >
                                <div className="w-20 h-20 liquid-glass rounded-full flex items-center justify-center">
                                    <ShoppingBag className="w-10 h-10 text-gray-400" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">Menyu hozircha bo'sh</h3>
                                    <p className="text-sm text-gray-500 max-w-[200px] mx-auto">
                                        Tez orada yangi va mazali taomlar qo'shiladi.
                                    </p>
                                </div>
                            </motion.div>
                        ) : (
                            (filteredProducts || []).map((product) => (
                                <motion.div
                                    key={product.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    className="liquid-card p-3 flex flex-col gap-3"
                                >
                                    {/* Image */}
                                    <div className="aspect-square bg-white/30 rounded-[1.5rem] w-full overflow-hidden relative shadow-inner">
                                        <img
                                            src={product.image?.replace('http://localhost:3000', '') || "https://placehold.co/400x400/f3f4f6/9ca3af?text=No+Image"}
                                            alt={product.name}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                            loading="lazy"
                                        />
                                    </div>

                                    {/* Info */}
                                    <div className="space-y-1.5">
                                        <h4 className="font-bold text-[15px] leading-tight text-gray-900 line-clamp-1">
                                            {product.name}
                                        </h4>
                                        <p className="text-gray-600 text-[11px] line-clamp-2 leading-relaxed h-[34px]">
                                            {product.description || "Tarkib ma'lumotlari mavjud emas"}
                                        </p>
                                    </div>

                                    {/* Footer */}
                                    <div className="mt-auto pt-1.5 flex flex-col gap-2">
                                        {/* Price */}
                                        <div className="flex items-end gap-1 px-1">
                                            <span className="font-bold text-base text-gray-900 leading-none">
                                                {product.price.toLocaleString('uz-UZ')}
                                            </span>
                                            <span className="text-[11px] text-gray-600 font-medium leading-none mb-[1px]">so'm</span>
                                        </div>

                                        {/* Action Button */}
                                        <div className="w-full">
                                            {(() => {
                                                const cartItem = items.find(i => i.id === product.id);
                                                const quantity = cartItem?.quantity || 0;

                                                if (quantity > 0) {
                                                    return (
                                                        <div className="flex items-center justify-between bg-black/80 backdrop-blur-md text-white rounded-xl p-1 h-10 shadow-lg shadow-black/10 w-full border border-white/10">
                                                            <motion.button
                                                                whileTap={{ scale: 0.9 }}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    if (quantity === 1) {
                                                                        useCartStore.getState().removeFromCart(product.id);
                                                                    } else {
                                                                        useCartStore.getState().updateQuantity(product.id, -1);
                                                                    }
                                                                }}
                                                                className="w-10 h-full flex items-center justify-center hover:bg-white/10 rounded-lg transition-colors"
                                                            >
                                                                <Minus className="w-4 h-4 font-bold" />
                                                            </motion.button>
                                                            <span className="font-bold text-sm text-center tabular-nums flex-1">{quantity}</span>
                                                            <motion.button
                                                                whileTap={{ scale: 0.9 }}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    useCartStore.getState().addToCart(product);
                                                                }}
                                                                className="w-10 h-full flex items-center justify-center hover:bg-white/10 rounded-lg transition-colors"
                                                            >
                                                                <Plus className="w-4 h-4 font-bold" />
                                                            </motion.button>
                                                        </div>
                                                    );
                                                }

                                                return (
                                                    <motion.button
                                                        whileTap={{ scale: 0.95 }}
                                                        onClick={() => handleAddToCart(product)}
                                                        className="h-10 w-full rounded-xl liquid-button flex items-center justify-center font-bold text-sm"
                                                    >
                                                        Qo'shish
                                                    </motion.button>
                                                );
                                            })()}
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        )
                    )}
                </AnimatePresence>
            </div>

            {/* Floating Cart Summary */}
            <AnimatePresence>
                {items.length > 0 && (
                    <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        className="fixed bottom-[90px] left-4 right-4 z-40 max-w-md mx-auto"
                    >
                        <div className="liquid-glass border-none !bg-black/80 !text-white p-3 px-5 rounded-2xl shadow-xl flex items-center justify-between cursor-pointer active:scale-95 transition-transform" onClick={() => navigate('/cart')}>
                            <div className="flex flex-col">
                                <span className="text-[10px] text-gray-300 font-medium uppercase tracking-wider">{items.reduce((a, b) => a + b.quantity, 0)} dona mahsulot</span>
                                <span className="font-bold text-lg leading-none mt-0.5">
                                    {items.reduce((a, b) => a + (b.price * b.quantity), 0).toLocaleString()} <span className="text-xs font-normal text-gray-400">so'm</span>
                                </span>
                            </div>
                            <div className="flex items-center gap-2 bg-white/20 pl-4 pr-3 py-2 rounded-xl backdrop-blur-sm hover:bg-white/25 transition-colors">
                                <span className="font-bold text-sm">Buyurtma</span>
                                <ShoppingBag className="w-4 h-4" />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
