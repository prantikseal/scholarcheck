"use client";

import React, { useEffect, useState } from "react";
import { motion, useAnimation, AnimatePresence } from "framer-motion";

interface StreamingTextProps {
  text: string;
  className?: string;
  speed?: number;
  onComplete?: () => void;
  showCursor?: boolean;
}

export const StreamingText: React.FC<StreamingTextProps> = ({
  text,
  className = "",
  speed = 30,
  onComplete,
  showCursor = true,
}) => {
  const [displayedText, setDisplayedText] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const controls = useAnimation();

  useEffect(() => {
    let currentIndex = 0;
    let timeoutId: NodeJS.Timeout;
    setDisplayedText("");
    setIsComplete(false);

    const streamText = () => {
      if (currentIndex <= text.length) {
        setDisplayedText(text.slice(0, currentIndex));
        currentIndex++;

        if (currentIndex <= text.length) {
          timeoutId = setTimeout(streamText, speed);
        } else {
          setIsComplete(true);
          onComplete?.();
        }
      }
    };

    controls.start({ opacity: 1 });
    streamText();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      setDisplayedText("");
      setIsComplete(false);
    };
  }, [text, speed, controls, onComplete]);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0 }}
        animate={controls}
        exit={{ opacity: 0 }}
        className={className}
      >
        <span className="whitespace-pre-wrap">{displayedText}</span>
        {showCursor && !isComplete && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.7] }}
            transition={{
              repeat: Infinity,
              duration: 0.7,
              ease: "easeInOut",
              repeatType: "reverse",
            }}
            className="inline-block w-[2px] h-[1.1em] align-middle ml-[1px] bg-blue-400"
          />
        )}
      </motion.div>
    </AnimatePresence>
  );
};
