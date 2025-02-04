import React from "react";
import { StreamingText } from "./StreamingText";

interface SearchAnimationProps {
  currentStep: string;
  steps: string[];
  searchQuery: string;
}

export const SearchAnimation: React.FC<SearchAnimationProps> = ({
  currentStep,
  steps,
  searchQuery,
}) => {
  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-lg border border-blue-100">
      <div className="mb-6">
        <div className="flex items-center space-x-2 text-blue-600 mb-2">
          <svg
            className="w-5 h-5 animate-spin"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span className="font-semibold">Searching for scholarships...</span>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg">
          <StreamingText
            text={`"${searchQuery}"`}
            className="text-blue-700"
            speed={50}
          />
        </div>
      </div>

      <div className="space-y-6">
        {steps.map((step, index) => {
          const isCurrentStep = currentStep === step;
          const isPastStep = steps.indexOf(currentStep) > index;
          const stepStatus = isCurrentStep
            ? "in-progress"
            : isPastStep
            ? "completed"
            : "pending";

          return (
            <div
              key={index}
              className={`transform transition-all duration-300 ${
                isCurrentStep ? "scale-102" : ""
              }`}
            >
              <div className="flex items-center space-x-3">
                <div
                  className={`w-8 h-8 flex items-center justify-center rounded-full border-2 transition-colors ${
                    stepStatus === "completed"
                      ? "border-green-500 bg-green-50"
                      : stepStatus === "in-progress"
                      ? "border-blue-500 bg-blue-50 animate-pulse"
                      : "border-gray-300"
                  }`}
                >
                  {stepStatus === "completed" ? (
                    <svg
                      className="w-5 h-5 text-green-500"
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
                    </svg>
                  ) : (
                    <span
                      className={
                        stepStatus === "in-progress"
                          ? "text-blue-500"
                          : "text-gray-400"
                      }
                    >
                      {index + 1}
                    </span>
                  )}
                </div>
                <div className="flex-1">
                  {isCurrentStep ? (
                    <StreamingText
                      text={step}
                      className={`font-medium ${
                        stepStatus === "completed"
                          ? "text-green-600"
                          : stepStatus === "in-progress"
                          ? "text-blue-600"
                          : "text-gray-400"
                      }`}
                    />
                  ) : (
                    <span
                      className={`font-medium ${
                        stepStatus === "completed"
                          ? "text-green-600"
                          : stepStatus === "in-progress"
                          ? "text-blue-600"
                          : "text-gray-400"
                      }`}
                    >
                      {step}
                    </span>
                  )}
                  {isCurrentStep && (
                    <div className="mt-2 ml-1">
                      <StreamingText
                        text="Processing..."
                        className="text-sm text-gray-500"
                        speed={100}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
