"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { StreamingText } from "./StreamingText";

interface Question {
  id: string;
  text: string;
  options?: string[];
  type: "text" | "select" | "confirm";
  param: "caste" | "religion" | "state" | "educationLevel" | "income" | "category";
}

interface SearchQuestionnaireProps {
  missingParams: string[];
  onComplete: (answers: Record<string, string>) => void;
  onCancel: () => void;
}

const QUESTIONS: Record<string, Question> = {
  caste: {
    id: "caste",
    text: "What is your caste category?",
    options: ["General", "SC", "ST", "OBC", "Other"],
    type: "select",
    param: "caste"
  },
  religion: {
    id: "religion",
    text: "What is your religion?",
    options: ["Hindu", "Muslim", "Christian", "Buddhist", "Sikh", "Other"],
    type: "select",
    param: "religion"
  },
  state: {
    id: "state",
    text: "Which state are you looking for scholarships in?",
    type: "text",
    param: "state"
  },
  educationLevel: {
    id: "educationLevel",
    text: "What is your education level?",
    options: [
      "High School",
      "Undergraduate",
      "Postgraduate",
      "PhD",
      "Diploma",
      "Professional Course"
    ],
    type: "select",
    param: "educationLevel"
  },
  income: {
    id: "income",
    text: "What is your family's annual income range?",
    options: [
      "Below 1 Lakh",
      "1-2.5 Lakhs",
      "2.5-5 Lakhs",
      "5-8 Lakhs",
      "Above 8 Lakhs"
    ],
    type: "select",
    param: "income"
  },
  category: {
    id: "category",
    text: "Do you belong to any special category?",
    options: [
      "Minority",
      "Physically Challenged",
      "Single Parent",
      "Merit Based",
      "Sports Quota",
      "None"
    ],
    type: "select",
    param: "category"
  }
};

export function SearchQuestionnaire({
  missingParams,
  onComplete,
  onCancel
}: SearchQuestionnaireProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = React.useState(0);
  const [answers, setAnswers] = React.useState<Record<string, string>>({});
  const [inputValue, setInputValue] = React.useState("");

  const currentParam = missingParams[currentQuestionIndex];
  const currentQuestion = QUESTIONS[currentParam];

  const handleAnswer = (answer: string) => {
    const newAnswers = { ...answers, [currentParam]: answer };
    setAnswers(newAnswers);
    setInputValue("");

    if (currentQuestionIndex === missingParams.length - 1) {
      onComplete(newAnswers);
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handleSubmitText = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      handleAnswer(inputValue.trim());
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        className="bg-gray-900/90 rounded-xl p-6 max-w-lg w-full border border-blue-500/20 shadow-xl"
      >
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-blue-300 mb-2">
            <StreamingText
              text="Additional Information Needed"
              speed={20}
              showCursor={false}
            />
          </h3>
          <p className="text-blue-200/80 text-sm">
            <StreamingText
              text="Please help us understand your requirements better"
              speed={15}
              showCursor={false}
            />
          </p>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="mb-4">
              <StreamingText
                text={currentQuestion.text}
                className="text-lg text-blue-200"
                speed={20}
              />
            </div>

            {currentQuestion.type === "select" ? (
              <div className="grid grid-cols-2 gap-3">
                {currentQuestion.options?.map((option) => (
                  <motion.button
                    key={option}
                    onClick={() => handleAnswer(option)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-4 py-3 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 transition-colors text-sm text-left"
                  >
                    {option}
                  </motion.button>
                ))}
              </div>
            ) : (
              <form onSubmit={handleSubmitText} className="space-y-4">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  className="w-full px-4 py-3 bg-blue-500/10 rounded-lg border border-blue-500/20 text-blue-200 placeholder-blue-400/50 focus:outline-none focus:border-blue-500/50"
                  placeholder="Type your answer..."
                  autoFocus
                />
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Continue
                </motion.button>
              </form>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="mt-6 flex items-center justify-between text-sm text-blue-300/70">
          <span>
            Question {currentQuestionIndex + 1} of {missingParams.length}
          </span>
          <button
            onClick={onCancel}
            className="text-blue-400 hover:text-blue-300 transition-colors"
          >
            Cancel
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
} 