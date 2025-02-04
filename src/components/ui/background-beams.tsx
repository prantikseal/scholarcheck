"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

export const BackgroundBeams = () => {
  const [dimensions, setDimensions] = useState({ width: 1000, height: 1000 });

  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);

    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="h-full w-full relative">
        {/* Gradients */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-600 opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-blue-900 to-blue-900/0 opacity-10" />

        {/* Beams */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0"
        >
          <div className="absolute top-0 left-1/4 w-1 h-full bg-gradient-to-b from-blue-500 to-transparent opacity-20 blur-sm" />
          <div className="absolute top-0 left-1/2 w-1 h-full bg-gradient-to-b from-blue-400 to-transparent opacity-20 blur-sm" />
          <div className="absolute top-0 left-3/4 w-1 h-full bg-gradient-to-b from-blue-600 to-transparent opacity-20 blur-sm" />
        </motion.div>

        {/* Floating particles */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="absolute inset-0"
        >
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{
                x: Math.random() * dimensions.width,
                y: Math.random() * dimensions.height,
                scale: 0,
              }}
              animate={{
                x: Math.random() * dimensions.width,
                y: Math.random() * dimensions.height,
                scale: [0, 1, 0],
              }}
              transition={{
                duration: Math.random() * 3 + 2,
                repeat: Infinity,
                repeatType: "loop",
              }}
              className="absolute w-1 h-1 bg-blue-400 rounded-full"
            />
          ))}
        </motion.div>
      </div>
    </div>
  );
};
