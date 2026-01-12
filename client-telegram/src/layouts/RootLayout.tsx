import { Outlet } from "react-router-dom"
import { BottomNav } from "@/components/layout/BottomNav"

export function RootLayout() {
    return (
        <div className="min-h-screen bg-secondary/30 pb-24">
            <main className="container max-w-md mx-auto p-4">
                <Outlet />
            </main>
            <BottomNav />
        </div>
    )
}
