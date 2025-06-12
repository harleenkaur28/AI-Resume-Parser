"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface LoaderProps {
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "default" | "dots" | "pulse" | "spinner";
  className?: string;
  text?: string;
}

export function Loader({ 
  size = "md", 
  variant = "default", 
  className,
  text
}: LoaderProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8", 
    lg: "w-12 h-12",
    xl: "w-16 h-16"
  };

  const textSizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg", 
    xl: "text-xl"
  };

  if (variant === "dots") {
    return (
      <div className={cn("flex flex-col items-center space-y-4", className)}>
        <div className="flex space-x-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className={cn(
                "bg-[#76ABAE] rounded-full",
                size === "sm" ? "w-2 h-2" : size === "md" ? "w-3 h-3" : size === "lg" ? "w-4 h-4" : "w-5 h-5"
              )}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 1, 0.3],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
        {text && (
          <motion.p 
            className={cn("text-[#EEEEEE]/80", textSizes[size])}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {text}
          </motion.p>
        )}
      </div>
    );
  }

  if (variant === "pulse") {
    return (
      <div className={cn("flex flex-col items-center space-y-4", className)}>
        <motion.div
          className={cn(
            "bg-gradient-to-r from-[#76ABAE] to-[#76ABAE]/50 rounded-full",
            sizeClasses[size]
          )}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.7, 1, 0.7],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        {text && (
          <motion.p 
            className={cn("text-[#EEEEEE]/80", textSizes[size])}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {text}
          </motion.p>
        )}
      </div>
    );
  }

  if (variant === "spinner") {
    return (
      <div className={cn("flex flex-col items-center space-y-4", className)}>
        <motion.div
          className={cn(
            "border-4 border-[#76ABAE]/20 border-t-[#76ABAE] rounded-full",
            sizeClasses[size]
          )}
          animate={{ rotate: 360 }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "linear",
          }}
        />
        {text && (
          <motion.p 
            className={cn("text-[#EEEEEE]/80", textSizes[size])}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {text}
          </motion.p>
        )}
      </div>
    );
  }

  // Default variant - sophisticated loading animation
  return (
    <div className={cn("flex flex-col items-center space-y-4", className)}>
      <div className="relative">
        {/* Outer ring */}
        <motion.div
          className={cn(
            "border-2 border-[#76ABAE]/20 rounded-full absolute inset-0",
            sizeClasses[size]
          )}
          animate={{ rotate: 360 }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "linear",
          }}
        />
        {/* Inner spinning element */}
        <motion.div
          className={cn(
            "border-2 border-transparent border-t-[#76ABAE] border-r-[#76ABAE] rounded-full",
            sizeClasses[size]
          )}
          animate={{ rotate: -360 }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "linear",
          }}
        />
        {/* Center dot */}
        <motion.div
          className={cn(
            "absolute inset-0 m-auto bg-[#76ABAE] rounded-full",
            size === "sm" ? "w-1 h-1" : size === "md" ? "w-2 h-2" : size === "lg" ? "w-3 h-3" : "w-4 h-4"
          )}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.7, 1, 0.7],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>
      {text && (
        <motion.p 
          className={cn("text-[#EEEEEE]/80 text-center", textSizes[size])}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {text}
        </motion.p>
      )}
    </div>
  );
}

// Full screen loader overlay
export function LoaderOverlay({ 
  text = "Loading...", 
  variant = "default",
  size = "lg" 
}: LoaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-gradient-to-br from-[#222831] via-[#31363F] to-[#222831] flex items-center justify-center z-50"
    >
      <div className="text-center">
        <Loader variant={variant} size={size} text={text} />
      </div>
    </motion.div>
  );
}
