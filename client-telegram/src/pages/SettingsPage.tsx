import { useNavigate } from "react-router-dom"
import { ChevronLeft, Bell, Moon, Globe, LogOut, User as UserIcon } from "lucide-react"
import { useAuthStore } from "@/lib/auth.store"

export function SettingsPage() {
    const navigate = useNavigate()
    const { user, logout } = useAuthStore()

    const handleLogout = () => {
        logout();
        navigate('/login');
    }

    return (
        <div className="space-y-6 pb-24">
            <div className="flex items-center gap-4 pt-4 px-2">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 bg-white rounded-xl shadow-sm border border-gray-100"
                >
                    <ChevronLeft className="w-5 h-5 text-gray-700" />
                </button>
                <h1 className="text-2xl font-bold text-gray-900">Sozlamalar</h1>
            </div>

            {/* Profile Card */}
            <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                    <UserIcon className="w-8 h-8" />
                </div>
                <div>
                    <h2 className="text-lg font-bold text-gray-900">
                        {user?.firstName} {user?.lastName}
                    </h2>
                    <p className="text-gray-500 font-medium text-sm">
                        {user?.phone || "+998 -- --- -- --"}
                    </p>
                </div>
            </div>

            <div className="space-y-3">
                <SettingItem icon={Bell} label="Bildirishnomalar" value="Yoqilgan" />
                <SettingItem icon={Globe} label="Til" value="O'zbekcha" />
                <SettingItem icon={Moon} label="Tunggi rejim" value="O'chirilgan" />

                <button
                    onClick={handleLogout}
                    className="w-full bg-red-50 p-4 rounded-2xl border border-red-100 flex items-center gap-3 text-red-600 font-bold active:scale-95 transition-transform"
                >
                    <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                        <LogOut className="w-5 h-5" />
                    </div>
                    Chiqish
                </button>
            </div>

            <div className="text-center text-sm text-gray-400 pt-8">
                Versiya 1.0.0
            </div>
        </div>
    )
}

function SettingItem({ icon: Icon, label, value }: { icon: any, label: string, value: string }) {
    return (
        <div className="w-full bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-500">
                    <Icon className="w-5 h-5" />
                </div>
                <span className="font-bold text-gray-700">{label}</span>
            </div>
            <span className="text-sm font-medium text-gray-400">{value}</span>
        </div>
    )
}
