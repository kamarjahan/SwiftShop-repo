"use client";

import { CheckCircle, Clock, Package, Truck, XCircle, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function OrderTimeline({ status }: { status: string }) {
  const getSteps = () => {
    const isCancelled = status?.includes("Cancel") || status === "Cancelled";
    const isReturned = status?.includes("Return") || status?.includes("Replace");

    if (isCancelled) {
      return [
        { label: "Order Placed", icon: <Package className="w-5 h-5" />, completed: true },
        { label: "Cancelled", icon: <XCircle className="w-5 h-5" />, completed: true, isError: true },
      ];
    }

    if (isReturned) {
      return [
        { label: "Delivered", icon: <CheckCircle className="w-5 h-5" />, completed: true },
        { label: status, icon: <AlertCircle className="w-5 h-5" />, completed: true, isWarning: true },
      ];
    }

    const steps = [
      { label: "Order Placed", icon: <Package className="w-5 h-5" />, statuses: ["Pending", "Pending (COD)", "Processing", "Shipped", "Out for Delivery", "Delivered"] },
      { label: "Processing", icon: <Clock className="w-5 h-5" />, statuses: ["Processing", "Shipped", "Out for Delivery", "Delivered"] },
      { label: "Shipped", icon: <Truck className="w-5 h-5" />, statuses: ["Shipped", "Out for Delivery", "Delivered"] },
      { label: "Delivered", icon: <CheckCircle className="w-5 h-5" />, statuses: ["Delivered"] },
    ];

    const currentStatus = status || "Pending";

    return steps.map((step, index) => {
      const isCompleted = step.statuses.includes(currentStatus);
      const isCurrent = step.label === currentStatus || 
        (currentStatus.includes("Pending") && step.label === "Order Placed") || 
        (currentStatus === "Out for Delivery" && step.label === "Shipped"); // Special fallback

      return {
        ...step,
        completed: isCompleted,
        isCurrent: isCurrent
      };
    });
  };

  const steps = getSteps();

  return (
    <div className="py-4 w-full">
      <div className="flex items-center justify-between relative">
        {/* Background Line */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-bento-border rounded-full z-0"></div>
        
        {/* Active Line */}
        <motion.div 
          className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-foreground rounded-full z-0"
          initial={{ width: "0%" }}
          animate={{ 
            width: `${((steps.filter(s => s.completed).length - 1) / (Math.max(1, steps.length - 1))) * 100}%` 
          }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        />

        {steps.map((step, idx) => {
          let bgColor = step.completed ? "bg-foreground" : "bg-bento-card border-2 border-bento-border";
          let iconColor = step.completed ? "text-background" : "text-foreground/30";
          let textColor = step.completed ? "text-foreground" : "text-foreground/40";
          
          if (step.isError) {
            bgColor = "bg-red-500";
            iconColor = "text-white";
            textColor = "text-red-500 font-bold";
          } else if (step.isWarning) {
            bgColor = "bg-orange-500";
            iconColor = "text-white";
            textColor = "text-orange-500 font-bold";
          }

          return (
            <div key={idx} className="relative z-10 flex flex-col items-center gap-2">
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: idx * 0.1 }}
                className={`w-10 h-10 rounded-full flex items-center justify-center ${bgColor} ${step.completed && !step.isError && !step.isWarning ? 'shadow-lg shadow-foreground/20' : ''}`}
              >
                <div className={iconColor}>{step.icon}</div>
              </motion.div>
              <div className="absolute top-12 w-24 text-center">
                <span className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider ${textColor}`}>
                  {step.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>
      <div className="h-10"></div> {/* Spacer for absolute labels */}
    </div>
  );
}
