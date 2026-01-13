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
        <div className="fixed bottom-0 left-0 right-0 p-4 z-50 pointer-events-none">
            <nav className="bg-white/80 backdrop-blur-xl border border-white/20 shadow-lg shadow-black/5 rounded-2xl flex justify-around items-center p-2 pointer-events-auto max-w-md mx-auto">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className="relative flex flex-col items-center justify-center w-14 h-14 rounded-xl transition-colors"
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="nav-pill"
                                    className="absolute inset-0 bg-primary/10 rounded-xl"
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                />
                            )}

                            <div className="relative z-10">
                                <item.icon
                                    className={`w-6 h-6 transition-colors ${isActive ? "text-primary fill-current" : "text-muted-foreground"}`}
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
