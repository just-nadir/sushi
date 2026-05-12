import { motion } from "framer-motion";
import { Check } from "lucide-react";

interface OrderProgressBarProps {
    status: string;
}

const steps = [
    { key: "NEW", label: "Qabul" },
    { key: "COOKING", label: "Tayyorlanmoqda" },
    { key: "READY", label: "Tayyor" },
    { key: "DELIVERY", label: "Yo'lda" },
    { key: "COMPLETED", label: "Yetkazildi" },
];

function getStepIndex(status: string): number {
    if (status === "CONFIRMED") return 0;
    const idx = steps.findIndex(s => s.key === status);
    return idx >= 0 ? idx : 0;
}

export function OrderProgressBar({ status }: OrderProgressBarProps) {
    if (status === "CANCELLED") {
        return (
            <div className="flex items-center gap-2 py-2">
                <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center">
                    <span className="text-red-500 text-xs font-bold">✕</span>
                </div>
                <span className="text-sm font-medium text-red-600">Bekor qilindi</span>
            </div>
        );
    }

    const isFullyDone = ["COMPLETED", "DELIVERED"].includes(status);
    const currentIndex = isFullyDone ? steps.length - 1 : getStepIndex(status);

    return (
        <div className="py-3">
            {/* Progress line */}
            <div className="relative flex items-center justify-between mb-2">
                {/* Background track */}
                <div className="absolute top-[9px] left-3 right-3 h-[3px] bg-gray-100 rounded-full" />
                {/* Filled track */}
                <motion.div
                    className="absolute top-[9px] left-3 h-[3px] bg-primary rounded-full"
                    initial={{ width: "0%" }}
                    animate={{ width: `calc(${(currentIndex / (steps.length - 1)) * 100}% - 24px)` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                />

                {/* Dots */}
                {steps.map((step, i) => {
                    const isDone = i < currentIndex || isFullyDone;
                    const isActive = i === currentIndex && !isFullyDone;

                    return (
                        <div key={step.key} className="relative z-10 flex flex-col items-center">
                            <div
                                className={`w-[18px] h-[18px] rounded-full flex items-center justify-center transition-all ${
                                    isDone
                                        ? "bg-primary"
                                        : isActive
                                            ? "bg-primary ring-4 ring-primary/20"
                                            : "bg-gray-200"
                                }`}
                            >
                                {isDone && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                                {isActive && (
                                    <motion.div
                                        animate={{ scale: [1, 1.4, 1] }}
                                        transition={{ repeat: Infinity, duration: 1.2 }}
                                        className="w-2 h-2 bg-white rounded-full"
                                    />
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Labels */}
            <div className="flex justify-between">
                {steps.map((step, i) => {
                    const isDone = i < currentIndex || isFullyDone;
                    const isActive = i === currentIndex && !isFullyDone;
                    return (
                        <span
                            key={step.key}
                            className={`text-[9px] font-medium text-center max-w-[52px] leading-tight ${
                                isDone || isActive ? "text-gray-900" : "text-gray-400"
                            }`}
                        >
                            {step.label}
                        </span>
                    );
                })}
            </div>
        </div>
    );
}
