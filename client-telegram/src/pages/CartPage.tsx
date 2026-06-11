import { useCartStore } from "@/lib/store"
import { Trash2, Plus, Minus, ArrowLeft, ShoppingBag } from "lucide-react"
import { useNavigate } from "react-router-dom"

export function CartPage() {
    const { items, removeFromCart, updateQuantity, total } = useCartStore();
    const navigate = useNavigate();

    if (items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-[80vh] gap-4 px-4">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
                    <ShoppingBag className="w-10 h-10 text-gray-300" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">Savatcha bo'sh</h2>
                <p className="text-sm text-gray-500 text-center">Menyudan mahsulotlarni qo'shing</p>
                <button
                    onClick={() => navigate('/')}
                    className="mt-2 px-6 py-3 bg-primary text-white rounded-xl font-semibold text-sm active:scale-95 transition-transform"
                >
                    Menyuga qaytish
                </button>
            </div>
        )
    }

    return (
        <div className="min-h-screen pb-56">
            {/* Header */}
            <div className="sticky top-0 z-20 bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3">
                <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                    <ArrowLeft className="w-5 h-5 text-gray-700" />
                </button>
                <h1 className="text-xl font-bold text-gray-900">Savatcha</h1>
                <span className="text-sm text-gray-500 ml-auto">{items.length} ta mahsulot</span>
            </div>

            {/* Items */}
            <div className="px-4 pt-4 space-y-3">
                {items.map(item => (
                    <div key={item.id} className="flex gap-3 bg-white rounded-2xl p-3 border border-gray-100">
                        <div className="w-20 h-20 rounded-xl bg-gray-100 overflow-hidden shrink-0">
                            <img
                                src={item.image?.replace('http://localhost:3000', '') || "https://placehold.co/100"}
                                alt={item.name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="flex-1 flex flex-col justify-between min-w-0">
                            <div className="flex justify-between items-start gap-2">
                                <h3 className="font-semibold text-sm text-gray-900 line-clamp-1">{item.name}</h3>
                                <button
                                    onClick={() => removeFromCart(item.id)}
                                    className="w-7 h-7 rounded-full bg-red-50 flex items-center justify-center shrink-0"
                                >
                                    <Trash2 className="w-3.5 h-3.5 text-red-500" />
                                </button>
                            </div>
                            <div className="flex items-center justify-between mt-2">
                                <span className="font-bold text-gray-900">
                                    {(item.price * item.quantity).toLocaleString()} <span className="text-xs font-normal text-gray-500">so'm</span>
                                </span>
                                <div className="flex items-center gap-2 bg-gray-100 rounded-full h-8 px-1">
                                    <button
                                        onClick={() => {
                                            if (item.quantity > 1) updateQuantity(item.id, -1);
                                            else removeFromCart(item.id);
                                        }}
                                        className="w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-sm active:scale-90 transition-transform"
                                    >
                                        <Minus className="w-3 h-3 text-gray-700" />
                                    </button>
                                    <span className="text-sm font-bold w-5 text-center">{item.quantity}</span>
                                    <button
                                        onClick={() => updateQuantity(item.id, 1)}
                                        className="w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-sm active:scale-90 transition-transform"
                                    >
                                        <Plus className="w-3 h-3 text-gray-700" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Bottom Bar */}
            <div className="fixed bottom-16 left-0 right-0 z-40 bg-white border-t border-gray-100 p-4">
                <div className="max-w-md mx-auto">
                    <div className="flex justify-between items-center mb-3 px-1">
                        <span className="text-gray-500 text-sm">Jami</span>
                        <span className="text-xl font-bold text-gray-900">{total().toLocaleString()} so'm</span>
                    </div>
                    <button
                        onClick={() => navigate('/checkout')}
                        className="w-full h-13 py-3.5 bg-primary text-white rounded-xl font-bold text-base active:scale-[0.98] transition-transform shadow-sm"
                    >
                        Buyurtma berish
                    </button>
                </div>
            </div>
        </div>
    )
}
