import { useEffect } from "react";
import { motion, useAnimation } from "framer-motion";

export const TextGenerateEffect = ({
  words,
  className = "",
}: {
  words: string;
  className?: string;
}) => {
  const controls = useAnimation();
  const wordsArray = words.split(" ");

  useEffect(() => {
    controls.start({
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    });
  }, [controls, words]);

  return (
    <motion.div className={`w-full ${className}`}>
      {wordsArray.map((word, idx) => {
        return (
          <motion.span
            key={word + idx}
            className="inline-block mr-2"
            initial={{ opacity: 0, y: 20 }}
            animate={controls}
            transition={{
              duration: 0.5,
              delay: idx * 0.1,
            }}
          >
            {word}
          </motion.span>
        );
      })}
    </motion.div>
  );
};
