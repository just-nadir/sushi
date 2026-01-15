import { Home, Clock, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";

import { useIsInputFocused } from "@/hooks/useIsInputFocused";

export function BottomNav() {
    const location = useLocation();
    const isInputFocused = useIsInputFocused();

    const navItems = [
        { name: "Asosiy", icon: Home, path: "/" },
        { name: "Tarix", icon: Clock, path: "/history" },
        { name: "Profil", icon: User, path: "/profile" },
    ];

    if (isInputFocused) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-t border-white/20 pb-safe shadow-lg">
            <nav className="flex justify-around items-center h-[70px] max-w-md mx-auto px-6">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className="relative flex flex-col items-center justify-center w-12 h-12 rounded-2xl transition-all duration-300"
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="nav-pill"
                                    className="absolute inset-0 bg-primary/10 rounded-2xl"
                                    transition={{ type: "spring", stiffness: 350, damping: 25 }}
                                />
                            )}

                            <div className="relative z-10 flex flex-col items-center gap-1">
                                <item.icon
                                    className={`w-6 h-6 transition-colors duration-300 ${isActive ? "text-primary" : "text-gray-400"}`}
                                    strokeWidth={isActive ? 2.5 : 2}
                                />
                                {isActive && (
                                    <motion.div
                                        layoutId="nav-dot"
                                        className="w-1 h-1 rounded-full bg-primary"
                                    />
                                )}
                            </div>
                        </Link>
                    )
                })}
            </nav>
        </div>
    );
}
