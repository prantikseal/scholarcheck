"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface CardHoverEffectProps {
  items: {
    title: string;
    description: string;
    icon?: React.ReactNode;
  }[];
  className?: string;
}

export const CardHoverEffect = ({ items, className }: CardHoverEffectProps) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div
      className={cn(
        "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 px-4 md:px-8 lg:px-12",
        className
      )}
    >
      {items.map((item, idx) => (
        <motion.div
          key={item.title + idx}
          className="relative group"
          onMouseEnter={() => setHoveredIndex(idx)}
          onMouseLeave={() => setHoveredIndex(null)}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: idx * 0.1 }}
        >
          <div className="relative h-full overflow-hidden rounded-2xl border border-gray-800 bg-gradient-to-b from-gray-800/50 to-gray-900/50 p-8">
            <motion.div
              className="pointer-events-none absolute inset-0 bg-gradient-to-b from-blue-500 to-blue-600 opacity-0 transition-opacity duration-300"
              animate={{
                opacity: hoveredIndex === idx ? 0.1 : 0,
              }}
            />

            <div className="relative z-10 h-full">
              {item.icon && (
                <motion.div
                  initial={{ scale: 1 }}
                  animate={{ scale: hoveredIndex === idx ? 1.1 : 1 }}
                  transition={{ duration: 0.3 }}
                  className="mb-4 w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:text-white transition duration-300"
                >
                  {item.icon}
                </motion.div>
              )}
              <motion.h3
                initial={{ scale: 1 }}
                animate={{ scale: hoveredIndex === idx ? 1.05 : 1 }}
                transition={{ duration: 0.3 }}
                className="text-xl font-semibold text-blue-200 group-hover:text-white mb-2 transition duration-300"
              >
                {item.title}
              </motion.h3>
              <motion.p
                initial={{ opacity: 0.8 }}
                animate={{ opacity: hoveredIndex === idx ? 1 : 0.8 }}
                transition={{ duration: 0.3 }}
                className="text-gray-400 group-hover:text-blue-100 text-sm transition duration-300"
              >
                {item.description}
              </motion.p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};
