import { useAuthStore } from "@/lib/auth.store"
import { User, Phone, ShoppingBag, LogOut, ChevronRight } from "lucide-react"
import { useNavigate } from "react-router-dom"

export function ProfilePage() {
    const { user, logout } = useAuthStore()
    const navigate = useNavigate()

    return (
        <div className="pb-24 min-h-screen">
            {/* Header */}
            <div className="sticky top-0 z-20 bg-white border-b border-gray-100 px-4 py-3">
                <h1 className="text-xl font-bold text-gray-900">Profil</h1>
            </div>

            <div className="px-4 pt-4 space-y-4">
                {/* User Card */}
                <div className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4">
                    <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center text-xl font-bold text-primary">
                        {user?.fullName?.[0]?.toUpperCase() || <User className="w-6 h-6" />}
                    </div>
                    <div>
                        <h2 className="font-bold text-gray-900 text-lg">
                            {user?.fullName || "Foydalanuvchi"}
                        </h2>
                        <div className="flex items-center gap-1.5 text-gray-500 text-sm mt-0.5">
                            <Phone className="w-3.5 h-3.5" />
                            <span>{user?.phone || localStorage.getItem('user-phone') || "Noma'lum"}</span>
                        </div>
                    </div>
                </div>

                {/* Menu */}
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden divide-y divide-gray-50">
                    <button
                        onClick={() => navigate('/history')}
                        className="w-full px-4 py-4 flex items-center justify-between"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center">
                                <ShoppingBag className="w-4.5 h-4.5 text-blue-600" />
                            </div>
                            <span className="font-medium text-gray-900 text-sm">Buyurtmalar tarixi</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-300" />
                    </button>
                </div>

                {/* Logout */}
                <button
                    onClick={() => {
                        logout();
                        navigate('/login');
                    }}
                    className="w-full bg-white rounded-2xl border border-gray-100 px-4 py-4 flex items-center gap-3"
                >
                    <div className="w-9 h-9 bg-red-50 rounded-xl flex items-center justify-center">
                        <LogOut className="w-4.5 h-4.5 text-red-500" />
                    </div>
                    <span className="font-medium text-red-600 text-sm">Chiqish</span>
                </button>

                {/* Version */}
                <p className="text-center text-xs text-gray-400 pt-4">Versiya 1.0.0</p>
            </div>
        </div>
    )
}
