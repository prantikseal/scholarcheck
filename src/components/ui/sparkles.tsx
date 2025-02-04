import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export const SparklesCore = React.memo(
  ({
    minSize,
    maxSize,
    particleCount,
    className,
    particleColor,
  }: {
    minSize?: number;
    maxSize?: number;
    particleCount?: number;
    className?: string;
    particleColor?: string;
  }) => {
    const particles = React.useMemo(() => {
      const particles = [];
      for (let i = 0; i < (particleCount || 50); i++) {
        particles.push({
          x: Math.random() * 100,
          y: Math.random() * 100,
          size:
            Math.random() * (maxSize || 4 - (minSize || 1)) + (minSize || 1),
        });
      }
      return particles;
    }, [minSize, maxSize, particleCount]);

    return (
      <div className={cn("absolute inset-0 overflow-hidden", className)}>
        {particles.map((particle, i) => (
          <motion.div
            key={i}
            initial={{
              opacity: 1,
              scale: 0,
            }}
            animate={{
              opacity: [1, 0.8, 0],
              scale: [0, 0.8, 1.2],
              x: particle.x + "%",
              y: particle.y + "%",
            }}
            transition={{
              duration: Math.random() * 2 + 1,
              repeat: Infinity,
              ease: "easeOut",
            }}
            className="absolute rounded-full"
            style={{
              background: particleColor || "#fff",
              width: particle.size,
              height: particle.size,
            }}
          />
        ))}
      </div>
    );
  }
);

SparklesCore.displayName = "SparklesCore";

export const SparklesText = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn("relative", className)}>
      <SparklesCore
        minSize={0.4}
        maxSize={1}
        particleCount={30}
        className="absolute top-0 left-0"
        particleColor="#fff"
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
};
