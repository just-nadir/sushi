import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Clock } from "lucide-react";
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
        const interval = setInterval(checkStatus, 60000);
        return () => clearInterval(interval);
    }, []);

    if (isLoading || !status || status.isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex flex-col items-center justify-center p-6 bg-white"
            >
                <div className="max-w-sm w-full text-center space-y-6">
                    <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto">
                        <Clock className="w-10 h-10 text-red-500" />
                    </div>

                    <div className="space-y-2">
                        <h2 className="text-xl font-bold text-gray-900">{status.message}</h2>
                        <p className="text-gray-500 text-sm">
                            Hozirda buyurtma qabul qila olmaymiz.
                        </p>
                        {status.nextChange && (
                            <div className="inline-block bg-gray-100 px-4 py-2 rounded-xl mt-2">
                                <span className="text-sm font-medium text-gray-700">Ochilishi: {status.nextChange}</span>
                            </div>
                        )}
                    </div>

                    <div className="pt-4">
                        <p className="text-xs text-gray-400">
                            Bog'lanish:{" "}
                            <a href={`tel:${status.phone || "+998901234567"}`} className="text-primary font-medium">
                                {status.phone || "+998 90 123 45 67"}
                            </a>
                        </p>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
