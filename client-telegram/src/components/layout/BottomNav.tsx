import { Home, Clock, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";

export function BottomNav() {
    const location = useLocation();

    const navItems = [
        { name: "Asosiy", icon: Home, path: "/" },
        { name: "Tarix", icon: Clock, path: "/history" },
        { name: "Profil", icon: User, path: "/profile" },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 p-6 z-50 pointer-events-none flex justify-center">
            <nav className="liquid-glass rounded-full flex justify-between items-center p-2 pointer-events-auto w-full max-w-[320px] shadow-2xl shadow-primary/10 border border-white/40">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className="relative flex flex-col items-center justify-center w-16 h-16 rounded-full transition-all duration-300"
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="nav-pill"
                                    className="absolute inset-0 bg-primary shadow-lg shadow-primary/30 rounded-full"
                                    transition={{ type: "spring", stiffness: 350, damping: 25 }}
                                />
                            )}

                            <div className="relative z-10">
                                <item.icon
                                    className={`w-6 h-6 transition-colors duration-300 ${isActive ? "text-white" : "text-slate-500 dark:text-slate-400"}`}
                                    strokeWidth={isActive ? 2.5 : 2}
                                />
                            </div>
                        </Link>
                    )
                })}
            </nav>
        </div>
    );
}
