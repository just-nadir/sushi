import { Outlet, useNavigate, useLocation } from "react-router-dom"
import { BottomNav } from "@/components/layout/BottomNav"
import { useAuthStore } from "@/lib/auth.store"
import { useEffect } from "react"

export function RootLayout() {
    const { isAuthenticated } = useAuthStore();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (!isAuthenticated() && location.pathname !== '/login') {
            navigate('/login');
        }
    }, [isAuthenticated, navigate, location]);

    return (
        <div className="min-h-screen bg-background">
            <main className="max-w-md mx-auto min-h-screen pb-20">
                <Outlet />
            </main>
            {location.pathname !== '/login' && <BottomNav />}
        </div>
    )
}
