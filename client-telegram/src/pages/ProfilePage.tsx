import { useAuthStore } from "@/lib/auth.store"
import { motion } from "framer-motion"
import { LogOut, User, Phone, ShoppingBag, Settings, ChevronRight } from "lucide-react"

export function ProfilePage() {
    const { user, logout } = useAuthStore()

    return (
        <div className="space-y-6 pb-24">
            {/* Header */}
            <div className="flex items-center justify-between pt-4 px-2">
                <h1 className="text-2xl font-bold text-gray-900">Profil</h1>
            </div>

            {/* User Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -mr-10 -mt-10"></div>

                <div className="flex items-center gap-4 relative z-10">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-2xl border-4 border-white shadow-sm">
                        {user?.fullName?.[0] || <User className="w-8 h-8 text-gray-400" />}
                    </div>
                    <div>
                        <h2 className="font-bold text-lg text-gray-900">
                            {user?.fullName || "Foydalanuvchi"}
                        </h2>
                        <div className="flex items-center gap-1.5 text-gray-500 text-sm mt-0.5">
                            <Phone className="w-3.5 h-3.5" />
                            <span>{user?.phone || "+998 -- --- -- --"}</span>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Menu Items */}
            <div className="space-y-3">
                <MenuLink
                    icon={ShoppingBag}
                    label="Buyurtmalar tarixi"
                    path="/history"
                    color="text-blue-500 bg-blue-50"
                />
                <MenuLink
                    icon={Settings}
                    label="Sozlamalar"
                    path="/settings" // TODO: Add settings page
                    color="text-purple-500 bg-purple-50"
                />
            </div>

            {/* Version */}
            <div className="text-center text-xs text-gray-400 font-medium pt-8">
                Versiya 1.0.0
            </div>
        </div>
    )
}

import { useNavigate } from "react-router-dom"

function MenuLink({ icon: Icon, label, path, color }: { icon: any, label: string, path: string, color: string }) {
    const navigate = useNavigate();
    return (
        <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate(path)}
            className="w-full bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between group"
        >
            <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
                    <Icon className="w-5 h-5" />
                </div>
                <span className="font-bold text-gray-700">{label}</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-primary transition-colors" />
        </motion.button>
    )
}
