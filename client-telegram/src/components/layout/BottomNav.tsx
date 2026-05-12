import { Home, ClockArrowUp, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useIsInputFocused } from "@/hooks/useIsInputFocused";

export function BottomNav() {
    const location = useLocation();
    const isInputFocused = useIsInputFocused();

    const navItems = [
        { name: "Menyu", icon: Home, path: "/" },
        { name: "Buyurtmalar", icon: ClockArrowUp, path: "/history" },
        { name: "Profil", icon: User, path: "/profile" },
    ];

    if (isInputFocused) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 pb-safe">
            <nav className="flex justify-around items-center h-16 max-w-md mx-auto">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className="flex flex-col items-center justify-center gap-0.5 w-16 h-full"
                        >
                            <item.icon
                                className={`w-6 h-6 transition-colors ${isActive ? "text-primary" : "text-gray-400"}`}
                                strokeWidth={isActive ? 2.5 : 1.8}
                            />
                            <span className={`text-[10px] font-medium ${isActive ? "text-primary" : "text-gray-400"}`}>
                                {item.name}
                            </span>
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}
