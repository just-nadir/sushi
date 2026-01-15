import { Button } from "@/components/ui/Button"
import { useCartStore } from "@/lib/store"
import { Trash2, Plus, Minus } from "lucide-react"
import { useNavigate } from "react-router-dom"

export function CartPage() {
    const { items, removeFromCart, updateQuantity, total } = useCartStore();
    const navigate = useNavigate();

    const handleCheckout = () => {
        if (items.length === 0) {
            // Optionally, you could add a toast notification here
            // toast.error("Savatcha bo'sh");
            return;
        }
        navigate("/checkout");
    };

    // Removed unused logic

    if (items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
                <h2 className="text-xl font-semibold text-muted-foreground">Savatcha bo'sh 😕</h2>
                <Button onClick={() => navigate('/')}>Menyuga qaytish</Button>
            </div>
        )
    }

    return (
        <div className="space-y-6 pb-40 min-h-screen pt-24">
            <div className="flex items-center justify-between px-1">
                <h1 className="text-3xl font-bold tracking-tight">Savatcha</h1>
                <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
                    Yopish
                </Button>
            </div>

            <div className="space-y-4">
                {items.map(item => (
                    <div key={item.id} className="liquid-card p-4 flex gap-4">
                        <div className="h-20 w-20 bg-secondary rounded-xl shrink-0 overflow-hidden">
                            <img src={item.image?.replace('http://localhost:3000', '') || "https://placehold.co/100"} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 flex flex-col justify-between">
                            <div className="flex justify-between items-start">
                                <h3 className="font-bold text-gray-900 line-clamp-1">{item.name}</h3>
                                <button onClick={() => removeFromCart(item.id)} className="text-red-500 hover:bg-red-50 p-1 rounded-lg transition-colors">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="flex justify-between items-end mt-2">
                                <span className="font-bold text-lg text-primary">{(item.price * item.quantity).toLocaleString()}</span>

                                <div className="flex items-center gap-3 bg-gray-100 rounded-xl p-1">
                                    <button
                                        onClick={() => {
                                            if (item.quantity > 1) updateQuantity(item.id, -1);
                                            else removeFromCart(item.id);
                                        }}
                                        className="w-7 h-7 flex items-center justify-center bg-white rounded-lg shadow-sm text-sm font-bold hover:scale-95 transition-transform"
                                    >
                                        <Minus className="w-3.5 h-3.5" />
                                    </button>
                                    <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                                    <button
                                        onClick={() => updateQuantity(item.id, 1)}
                                        className="w-7 h-7 flex items-center justify-center bg-white rounded-lg shadow-sm text-sm font-bold text-primary hover:scale-95 transition-transform"
                                    >
                                        <Plus className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="fixed left-4 right-4 z-40" style={{ bottom: "calc(70px + env(safe-area-inset-bottom, 20px))" }}>
                <div className="liquid-glass border-none !bg-white/90 dark:!bg-black/90 backdrop-blur-xl rounded-[2rem] p-5 shadow-2xl space-y-4">
                    <div className="flex justify-between items-center text-lg font-bold px-2">
                        <span className="text-gray-600">Jami:</span>
                        <span className="text-2xl">{total().toLocaleString()} so'm</span>
                    </div>
                    <Button className="w-full h-12 text-lg rounded-xl font-bold shadow-lg shadow-primary/25" onClick={handleCheckout}>
                        Buyurtma berish
                    </Button>
                </div>
            </div>
        </div>
    )
}
