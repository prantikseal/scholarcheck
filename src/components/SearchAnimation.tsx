import React from "react";
import { motion } from "framer-motion";
import { StreamingText } from "./StreamingText";

interface SearchAnimationProps {
  currentStep: string;
  searchQuery: string;
}

const SEARCH_STEPS = [
  {
    id: "Analyzing search query",
    title: "Analyzing Your Query",
    description: "Converting your search into structured data...",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  },
  {
    id: "Searching scholarship databases",
    title: "Searching Databases",
    description: "Finding relevant scholarship sources...",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
    ),
  },
  {
    id: "Generating recommendations",
    title: "Generating Recommendations",
    description: "Creating personalized scholarship suggestions...",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13 10V3L4 14h7v7l9-11h-7z"
        />
      </svg>
    ),
  },
];

export const SearchAnimation: React.FC<SearchAnimationProps> = ({
  currentStep,
  searchQuery,
}) => {
  return (
    <div className="max-w-2xl mx-auto bg-gradient-to-b from-gray-900/50 to-gray-800/50 p-8 rounded-2xl shadow-lg border border-blue-500/20 backdrop-blur-sm">
      <div className="mb-6">
        <div className="flex items-center space-x-3 text-blue-400 mb-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-6 h-6"
          >
            <svg
              className="w-full h-full"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </motion.div>
          <span className="font-semibold text-lg">Processing Your Request</span>
        </div>
        <div className="bg-blue-500/10 p-4 rounded-lg border border-blue-500/20">
          <StreamingText
            text={`"${searchQuery}"`}
            className="text-blue-300"
            speed={50}
          />
        </div>
      </div>

      <div className="space-y-4">
        {SEARCH_STEPS.map((step, index) => {
          const isCurrentStep = currentStep === step.id;
          const isPastStep =
            SEARCH_STEPS.findIndex((s) => s.id === currentStep) > index;
          const stepStatus = isCurrentStep
            ? "in-progress"
            : isPastStep
            ? "completed"
            : "pending";

          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{
                opacity: stepStatus === "pending" ? 0.5 : 1,
                y: 0,
                scale: isCurrentStep ? 1.02 : 1,
              }}
              transition={{ duration: 0.5 }}
              className={`transform transition-all duration-300 ${
                isCurrentStep ? "bg-blue-500/10" : ""
              } rounded-lg p-4`}
            >
              <div className="flex items-start space-x-3">
                <div
                  className={`w-8 h-8 flex items-center justify-center rounded-full border-2 transition-colors ${
                    stepStatus === "completed"
                      ? "border-green-500 bg-green-500/10 text-green-500"
                      : stepStatus === "in-progress"
                      ? "border-blue-500 bg-blue-500/10 text-blue-400 animate-pulse"
                      : "border-gray-600 text-gray-600"
                  }`}
                >
                  {stepStatus === "completed" ? (
                    <motion.svg
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </motion.svg>
                  ) : (
                    <motion.div
                      animate={isCurrentStep ? { scale: [1, 1.2, 1] } : {}}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      {step.icon}
                    </motion.div>
                  )}
                </div>
                <div className="flex-1">
                  <h3
                    className={`font-medium ${
                      stepStatus === "completed"
                        ? "text-green-400"
                        : stepStatus === "in-progress"
                        ? "text-blue-400"
                        : "text-gray-400"
                    }`}
                  >
                    {step.title}
                  </h3>
                  {isCurrentStep && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="mt-1"
                    >
                      <StreamingText
                        text={step.description}
                        className="text-sm text-gray-400"
                        speed={30}
                      />
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
