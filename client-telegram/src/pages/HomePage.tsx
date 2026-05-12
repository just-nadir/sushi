import { Plus, Minus, Search } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { api, Category, Product } from "@/lib/api"
import { useState, useMemo, useRef } from "react"
import { useCartStore } from "@/lib/store"
import { motion, AnimatePresence } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { ActiveOrderBanner } from "@/components/ActiveOrderBanner"

export function HomePage() {
    const navigate = useNavigate();
    const { addToCart, items } = useCartStore();
    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchOpen, setSearchOpen] = useState(false);
    const searchRef = useRef<HTMLInputElement>(null);

    const { data: categories, isLoading: isCatLoading } = useQuery({
        queryKey: ['categories'],
        queryFn: async () => {
            const res = await api.get<Category[]>('/categories');
            return res.data;
        }
    });

    const { data: products, isLoading: isProdLoading } = useQuery({
        queryKey: ['products'],
        queryFn: async () => {
            const res = await api.get<Product[]>('/products');
            return res.data;
        }
    });

    const filteredProducts = useMemo(() => products?.filter(p => {
        const matchesCategory = activeCategory ? p.categoryId === activeCategory : true;
        const matchesSearch = searchQuery
            ? p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              p.description?.toLowerCase().includes(searchQuery.toLowerCase())
            : true;
        const isAvailable = p.isAvailable !== false;
        return matchesCategory && matchesSearch && isAvailable;
    }), [products, activeCategory, searchQuery]);

    const cartTotal = items.reduce((a, b) => a + (b.price * b.quantity), 0);
    const cartCount = items.reduce((a, b) => a + b.quantity, 0);

    return (
        <div className="pb-24 min-h-screen">
            {/* Header */}
            <div className="sticky top-0 z-30 bg-white border-b border-gray-100">
                <div className="px-4 pt-4 pb-3">
                    <div className="flex items-center justify-between mb-3">
                        <h1 className="text-2xl font-bold text-gray-900">Menyu</h1>
                        <button
                            onClick={() => { setSearchOpen(!searchOpen); setTimeout(() => searchRef.current?.focus(), 100); }}
                            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center"
                        >
                            <Search className="w-5 h-5 text-gray-600" />
                        </button>
                    </div>

                    {/* Search */}
                    <AnimatePresence>
                        {searchOpen && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                            >
                                <input
                                    ref={searchRef}
                                    type="text"
                                    placeholder="Qidirish..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full h-11 px-4 bg-gray-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/30 mb-3"
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Categories */}
                    <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-1">
                        <button
                            onClick={() => setActiveCategory(null)}
                            className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                                activeCategory === null
                                    ? "bg-primary text-white"
                                    : "bg-gray-100 text-gray-700"
                            }`}
                        >
                            Barchasi
                        </button>
                        {isCatLoading ? (
                            [1, 2, 3].map(i => <div key={i} className="shrink-0 h-9 w-20 bg-gray-100 rounded-full animate-pulse" />)
                        ) : (
                            categories?.map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => setActiveCategory(cat.id)}
                                    className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all flex items-center gap-1.5 ${
                                        activeCategory === cat.id
                                            ? "bg-primary text-white"
                                            : "bg-gray-100 text-gray-700"
                                    }`}
                                >
                                    {cat.image && (
                                        <img
                                            src={cat.image.replace('http://localhost:3000', '')}
                                            className="w-5 h-5 rounded-full object-cover"
                                        />
                                    )}
                                    {cat.name}
                                </button>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Active Order Banner */}
            <div className="px-4 pt-3">
                <ActiveOrderBanner />
            </div>

            {/* Products */}
            <div className="px-4 pt-2">
                {isProdLoading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="flex gap-3 animate-pulse">
                                <div className="w-28 h-28 bg-gray-200 rounded-2xl shrink-0" />
                                <div className="flex-1 py-2 space-y-2">
                                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                                    <div className="h-3 bg-gray-100 rounded w-full" />
                                    <div className="h-4 bg-gray-200 rounded w-1/3 mt-4" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (filteredProducts || []).length === 0 ? (
                    <div className="py-16 text-center">
                        <p className="text-gray-400 text-sm">Mahsulotlar topilmadi</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {(filteredProducts || []).map((product) => {
                            const cartItem = items.find(i => i.id === product.id);
                            const quantity = cartItem?.quantity || 0;

                            return (
                                <motion.div
                                    key={product.id}
                                    layout
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex gap-3 bg-white rounded-2xl p-3 border border-gray-100 shadow-sm"
                                >
                                    {/* Image */}
                                    <div className="w-28 h-28 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                                        <img
                                            src={product.image?.replace('http://localhost:3000', '') || "https://placehold.co/200x200/f5f5f5/ccc?text=📷"}
                                            alt={product.name}
                                            className="w-full h-full object-cover"
                                            loading="lazy"
                                        />
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 flex flex-col justify-between py-0.5 min-w-0">
                                        <div>
                                            <h3 className="font-semibold text-[15px] text-gray-900 leading-tight line-clamp-2">
                                                {product.name}
                                            </h3>
                                            <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                                                {product.description || ""}
                                            </p>
                                        </div>

                                        <div className="flex items-center justify-between mt-2">
                                            <span className="font-bold text-base text-gray-900">
                                                {product.price.toLocaleString()} <span className="text-xs font-normal text-gray-500">so'm</span>
                                            </span>

                                            {quantity > 0 ? (
                                                <div className="flex items-center gap-2 bg-primary rounded-full h-9 px-1">
                                                    <button
                                                        onClick={() => {
                                                            if (quantity === 1) useCartStore.getState().removeFromCart(product.id);
                                                            else useCartStore.getState().updateQuantity(product.id, -1);
                                                        }}
                                                        className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white active:scale-90 transition-transform"
                                                    >
                                                        <Minus className="w-3.5 h-3.5" />
                                                    </button>
                                                    <span className="text-white font-bold text-sm w-5 text-center">{quantity}</span>
                                                    <button
                                                        onClick={() => addToCart(product)}
                                                        className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white active:scale-90 transition-transform"
                                                    >
                                                        <Plus className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => addToCart(product)}
                                                    className="h-9 px-4 rounded-full bg-primary text-white text-sm font-semibold active:scale-95 transition-transform shadow-sm"
                                                >
                                                    Qo'shish
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Floating Cart Bar */}
            <AnimatePresence>
                {cartCount > 0 && (
                    <motion.div
                        initial={{ y: 80, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 80, opacity: 0 }}
                        className="fixed left-4 right-4 z-40 max-w-md mx-auto"
                        style={{ bottom: "calc(72px + env(safe-area-inset-bottom, 16px))" }}
                    >
                        <button
                            onClick={() => navigate('/cart')}
                            className="w-full bg-primary text-white rounded-2xl p-4 flex items-center justify-between shadow-lg shadow-primary/25 active:scale-[0.98] transition-transform"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                                    <span className="font-bold text-sm">{cartCount}</span>
                                </div>
                                <span className="font-semibold">Savatcha</span>
                            </div>
                            <span className="font-bold text-lg">{cartTotal.toLocaleString()} so'm</span>
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
