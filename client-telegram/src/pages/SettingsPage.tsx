import { useNavigate } from "react-router-dom"
import { useState } from "react"
import { ChevronLeft, Moon, Globe, LogOut, User as UserIcon } from "lucide-react"
import { useAuthStore } from "@/lib/auth.store"
import { motion, AnimatePresence } from "framer-motion"

export function SettingsPage() {
    const navigate = useNavigate()
    const { user, logout } = useAuthStore()

    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    const handleLogout = () => {
        setShowLogoutConfirm(true);
    }

    const confirmLogout = () => {
        logout();
        navigate('/login');
    }

    return (
        <div className="space-y-6 pb-24">
            <div className="flex items-center gap-4 pt-4 px-2">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 liquid-glass rounded-xl text-gray-700 hover:bg-white/40 transition-colors"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>
                <h1 className="text-2xl font-bold text-gray-900 drop-shadow-sm">Sozlamalar</h1>
            </div>

            {/* Profile Card */}
            <div className="liquid-card p-4 flex items-center gap-4 border border-white/40">
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-primary/20 to-purple-500/20 flex items-center justify-center text-primary shadow-inner">
                    <UserIcon className="w-8 h-8" />
                </div>
                <div>
                    <h2 className="text-lg font-bold text-gray-900">
                        {user?.fullName || "Foydalanuvchi"}
                    </h2>
                    <p className="text-gray-600 font-medium text-sm">
                        {user?.phone || "+998 -- --- -- --"}
                    </p>
                </div>
            </div>

            <div className="space-y-3">
                <SettingItem icon={Globe} label="Til" value="O'zbekcha" />
                <SettingItem icon={Moon} label="Tunggi rejim" value="O'chirilgan" />

                <button
                    onClick={handleLogout}
                    className="w-full bg-red-500/10 hover:bg-red-500/20 backdrop-blur-md p-4 rounded-3xl border border-red-500/20 flex items-center gap-3 text-red-600 font-bold active:scale-95 transition-all shadow-sm"
                >
                    <div className="w-10 h-10 rounded-2xl bg-red-500/20 flex items-center justify-center">
                        <LogOut className="w-5 h-5" />
                    </div>
                    Chiqish
                </button>
            </div>

            <div className="text-center text-sm text-gray-500 pt-8 font-medium">
                Versiya 1.0.0
            </div>
            {/* Logout Confirmation Modal */}
            <AnimatePresence>
                {showLogoutConfirm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="liquid-glass border-white/40 !bg-white/90 rounded-[2rem] p-6 w-full max-w-sm space-y-6 shadow-2xl"
                        >
                            <div className="text-center space-y-2">
                                <h3 className="text-xl font-bold text-gray-900">Tizimdan chiqish</h3>
                                <p className="text-gray-500 font-medium">Rostdan ham hisobingizdan chiqmoqchimisiz?</p>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowLogoutConfirm(false)}
                                    className="flex-1 h-12 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-900 font-bold transition-colors"
                                >
                                    Yo'q
                                </button>
                                <button
                                    onClick={confirmLogout}
                                    className="flex-1 h-12 rounded-2xl bg-red-500 text-white font-bold shadow-lg shadow-red-500/30 hover:bg-red-600 transition-all"
                                >
                                    Ha, chiqish
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

function SettingItem({ icon: Icon, label, value }: { icon: any, label: string, value: string }) {
    return (
        <div className="w-full liquid-glass p-4 rounded-3xl flex items-center justify-between transition-transform active:scale-[0.99] cursor-pointer hover:bg-white/50">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/40 flex items-center justify-center text-gray-700 shadow-sm border border-white/20">
                    <Icon className="w-5 h-5" />
                </div>
                <span className="font-bold text-gray-800">{label}</span>
            </div>
            <span className="text-sm font-medium text-gray-500 bg-white/30 px-3 py-1 rounded-full border border-white/20">{value}</span>
        </div>
    )
}
