import { Outlet } from "react-router-dom"
import { Sidebar } from "@/components/layout/Sidebar"

export function AdminLayout() {
    return (
        <div className="min-h-screen bg-muted/40">
            <Sidebar />
            <div className="sm:pl-64 flex flex-col min-h-screen">
                {/* Header Removed */}
                <main className="flex-1 p-4 sm:p-6 lg:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}
