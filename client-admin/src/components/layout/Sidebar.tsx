import { NavLink } from "react-router-dom"
import { LayoutDashboard, UtensilsCrossed, Settings, LogOut, ShoppingBag, LayoutGrid, ChefHat } from "lucide-react"
import { cn } from "@/lib/utils"

export function Sidebar() {
    const navItems = [
        { name: "Dashboard", icon: LayoutDashboard, path: "/" },
        { name: "Mahsulotlar", icon: UtensilsCrossed, path: "/products" },
        { name: "Kategoriyalar", icon: LayoutGrid, path: "/categories" },
        { name: "Buyurtmalar", icon: ShoppingBag, path: "/orders" },
        { name: "Sozlamalar", icon: Settings, path: "/settings" },
    ]

    return (
        <aside className="fixed inset-y-0 left-0 z-10 hidden w-72 flex-col border-r bg-white sm:flex shadow-sm">
            {/* Logo */}
            <div className="flex h-20 items-center gap-3 px-8 border-b border-gray-100">
                <div className="h-10 w-10 bg-gradient-to-tr from-primary to-orange-400 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20 text-white">
                    <ChefHat className="h-6 w-6" />
                </div>
                <div>
                    <h2 className="text-xl font-bold tracking-tight text-gray-900 leading-none">Sushi</h2>
                    <span className="text-xs font-medium text-muted-foreground tracking-widest uppercase">Admin</span>
                </div>
            </div>

            {/* Navigation */}
            <div className="flex-1 py-8 px-4">
                <nav className="flex flex-col gap-1.5 space-y-1">
                    <div className="px-4 pb-2">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Menyu</span>
                    </div>
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                cn(
                                    "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 group relative overflow-hidden",
                                    isActive
                                        ? "bg-primary text-white shadow-md shadow-orange-500/25"
                                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                )
                            }
                        >
                            <item.icon className="h-5 w-5" />
                            {item.name}
                        </NavLink>
                    ))}
                </nav>
            </div>

            {/* User Profile */}
            <div className="p-4 m-4 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="flex items-center gap-3 mb-3">
                    <div className="h-10 w-10 rounded-full bg-white border flex items-center justify-center font-bold text-gray-700 shadow-sm">
                        A
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <p className="text-sm font-bold text-gray-900 truncate">Administrator</p>
                        <p className="text-xs text-muted-foreground truncate">admin@sushi.uz</p>
                    </div>
                </div>
                <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-white border border-gray-200 py-2 text-xs font-bold text-red-500 hover:bg-red-50 hover:border-red-100 transition-colors shadow-sm">
                    <LogOut className="h-3.5 w-3.5" />
                    Tizimdan chiqish
                </button>
            </div>
        </aside>
    )
}
