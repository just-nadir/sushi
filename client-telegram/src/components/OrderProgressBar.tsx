import { motion } from "framer-motion";
import { CheckCircle2, Clock, ChefHat, Package, Truck, CircleDot } from "lucide-react";

interface OrderProgressBarProps {
    status: string;
}

const steps = [
    { key: "NEW", label: "Qabul qilindi", icon: Clock },
    { key: "COOKING", label: "Tayyorlanmoqda", icon: ChefHat },
    { key: "READY", label: "Tayyor", icon: Package },
    { key: "DELIVERY", label: "Yetkazilmoqda", icon: Truck },
    { key: "COMPLETED", label: "Yetkazildi", icon: CheckCircle2 },
];

function getStepIndex(status: string): number {
    if (status === "CONFIRMED") return 0; // Same as NEW visually
    const idx = steps.findIndex(s => s.key === status);
    return idx >= 0 ? idx : 0;
}

export function OrderProgressBar({ status }: OrderProgressBarProps) {
    if (status === "CANCELLED") {
        return (
            <div className="flex items-center gap-2 px-3 py-2 bg-red-50 rounded-xl border border-red-100">
                <div className="h-6 w-6 rounded-full bg-red-500 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">✕</span>
                </div>
                <span className="text-sm font-medium text-red-700">Buyurtma bekor qilindi</span>
            </div>
        );
    }

    // For completed/delivered orders, show all steps as done
    const isFullyDone = ["COMPLETED", "DELIVERED"].includes(status);
    const currentIndex = isFullyDone ? steps.length - 1 : getStepIndex(status);

    return (
        <div className="py-3">
            <div className="flex items-center justify-between relative">
                {/* Background line */}
                <div className="absolute top-4 left-[10%] right-[10%] h-[2px] bg-gray-200 rounded-full" />

                {/* Progress line */}
                <motion.div
                    className="absolute top-4 left-[10%] h-[2px] bg-primary rounded-full"
                    initial={{ width: "0%" }}
                    animate={{ width: `${(currentIndex / (steps.length - 1)) * 80}%` }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                />

                {/* Steps */}
                {steps.map((step, i) => {
                    const isActive = i === currentIndex && !isFullyDone;
                    const isDone = i < currentIndex || isFullyDone;
                    const Icon = step.icon;

                    return (
                        <div key={step.key} className="flex flex-col items-center z-10 relative">
                            <motion.div
                                initial={{ scale: 0.8 }}
                                animate={{ scale: isActive ? 1.1 : 1 }}
                                className={`h-8 w-8 rounded-full flex items-center justify-center transition-colors duration-300 ${
                                    isDone
                                        ? "bg-primary text-white shadow-md shadow-primary/30"
                                        : isActive
                                            ? "bg-primary text-white shadow-lg shadow-primary/40 ring-4 ring-primary/20"
                                            : "bg-white border-2 border-gray-200 text-gray-400"
                                }`}
                            >
                                {isDone ? (
                                    <CheckCircle2 className="h-4 w-4" />
                                ) : isActive ? (
                                    <motion.div
                                        animate={{ scale: [1, 1.2, 1] }}
                                        transition={{ repeat: Infinity, duration: 1.5 }}
                                    >
                                        <CircleDot className="h-4 w-4" />
                                    </motion.div>
                                ) : (
                                    <Icon className="h-3.5 w-3.5" />
                                )}
                            </motion.div>
                            <span className={`text-[9px] mt-1.5 font-medium text-center leading-tight max-w-[50px] ${
                                isDone || isActive ? "text-gray-900" : "text-gray-400"
                            }`}>
                                {step.label}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
