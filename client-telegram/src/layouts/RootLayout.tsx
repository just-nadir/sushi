import { Outlet, useNavigate, useLocation } from "react-router-dom"
import { BottomNav } from "@/components/layout/BottomNav"
import { useAuthStore } from "@/lib/auth.store"
import { useEffect } from "react"
import { AnimatePresence } from "framer-motion"

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
        <div className="min-h-screen relative overflow-hidden">
            <div className="mesh-background" />
            <main className="container max-w-md mx-auto p-4 relative z-10 pb-24 min-h-screen">
                <Outlet />
            </main>
            <AnimatePresence>
                {location.pathname !== '/login' && <BottomNav />}
            </AnimatePresence>
        </div>
    )
}
