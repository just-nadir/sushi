import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Lock, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function StoreStatusBlocker() {
    const [status, setStatus] = useState<{ isOpen: boolean, message: string, nextChange: string | null, phone?: string } | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkStatus = async () => {
            try {
                const res = await api.get('/store/status');
                setStatus(res.data);
            } catch (error) {
                console.error("Failed to check store status", error);
            } finally {
                setIsLoading(false);
            }
        };

        checkStatus();

        // Re-check every minute
        const interval = setInterval(checkStatus, 60000);
        return () => clearInterval(interval);
    }, []);

    if (isLoading || !status || status.isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
                animate={{ opacity: 1, backdropFilter: "blur(10px)" }}
                exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
                className="fixed inset-0 z-50 flex flex-col items-center justify-center p-6 text-center bg-black/60 text-white"
            >
                <motion.div
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    className="bg-zinc-900/90 border border-white/10 p-8 rounded-3xl shadow-2xl max-w-sm w-full space-y-6"
                >
                    <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto ring-1 ring-red-500/20">
                        {status.message.includes("Tanaffus") ? (
                            <Clock className="w-10 h-10 text-red-500" />
                        ) : (
                            <Lock className="w-10 h-10 text-red-500" />
                        )}
                    </div>

                    <div className="space-y-2">
                        <h2 className="text-2xl font-bold">{status.message}</h2>
                        <p className="text-gray-400 text-sm">
                            Hozirda buyurtma qabul qila olmaymiz.
                            {status.nextChange && (
                                <span className="block mt-2 text-white font-medium bg-white/10 py-1 px-3 rounded-lg w-fit mx-auto">
                                    Ochilishi: {status.nextChange}
                                </span>
                            )}
                        </p>
                    </div>

                    <div className="pt-4 border-t border-white/10">
                        <p className="text-xs text-gray-500">
                            Biz bilan bog'lanish: <a href={`tel:${status.phone || "+998901234567"}`} className="text-primary hover:underline">{status.phone || "+998 90 123 45 67"}</a>
                        </p>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
