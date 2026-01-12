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
        <div className="space-y-6 pb-20">
            <h1 className="text-2xl font-bold">Savatcha</h1>

            <div className="space-y-4">
                {items.map(item => (
                    <div key={item.id} className="bg-card p-4 rounded-xl shadow-sm border border-border/50 flex gap-4">
                        <div className="h-20 w-20 bg-secondary rounded-lg shrink-0 overflow-hidden">
                            <img src={item.image || "https://placehold.co/100"} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 flex flex-col justify-between">
                            <div className="flex justify-between items-start">
                                <h3 className="font-semibold line-clamp-1">{item.name}</h3>
                                <button onClick={() => removeFromCart(item.id)} className="text-destructive">
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="flex justify-between items-end mt-2">
                                <span className="font-bold">{(item.price * item.quantity).toLocaleString()}</span>

                                <div className="flex items-center gap-3 bg-secondary/50 rounded-lg p-1">
                                    <button
                                        onClick={() => {
                                            if (item.quantity > 1) updateQuantity(item.id, -1);
                                            else removeFromCart(item.id);
                                        }}
                                        className="w-6 h-6 flex items-center justify-center bg-white rounded shadow-sm text-sm font-bold"
                                    >
                                        <Minus className="w-3 h-3" />
                                    </button>
                                    <span className="text-sm font-medium w-4 text-center">{item.quantity}</span>
                                    <button
                                        onClick={() => updateQuantity(item.id, 1)}
                                        className="w-6 h-6 flex items-center justify-center bg-white rounded shadow-sm text-sm font-bold text-primary"
                                    >
                                        <Plus className="w-3 h-3" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="fixed bottom-16 left-0 right-0 p-4 bg-background/80 backdrop-blur-lg border-t z-10">
                <div className="container max-w-[600px] mx-auto space-y-4">
                    <div className="flex justify-between items-center text-lg font-bold">
                        <span>Jami:</span>
                        <span>{total().toLocaleString()} so'm</span>
                    </div>
                    <Button className="w-full h-12 text-lg" onClick={handleCheckout}>
                        Buyurtma berish
                    </Button>
                </div>
            </div>
        </div>
    )
}
