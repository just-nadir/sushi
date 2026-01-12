import { Outlet } from "react-router-dom"
import { Sidebar } from "@/components/layout/Sidebar"

export function AdminLayout() {
    return (
        <div className="min-h-screen bg-muted/40">
            <Sidebar />
            <div className="sm:pl-64 flex flex-col min-h-screen">
                <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-6 glass">
                    <h1 className="text-lg font-semibold md:text-xl">Dashboard</h1>
                    <div className="ml-auto flex items-center gap-2">
                        {/* User Profile or Notifications */}
                        <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center text-xs font-bold">
                            A
                        </div>
                    </div>
                </header>
                <main className="flex-1 p-4 sm:p-6 lg:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}
