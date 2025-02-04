"use client";

import React from "react";
import { motion } from "framer-motion";
import { Scholarship } from "@/types";
import { StreamingText } from "./StreamingText";
import { IconExternalLink } from "@tabler/icons-react";

export const ScholarshipCard: React.FC<Scholarship> = ({
  title,
  description,
  eligibility,
  deadline,
  amount,
  institution,
  applicationLink,
  requirements,
}) => {
  // Helper function to handle array or string formatting
  const formatList = (input: string[] | string | undefined) => {
    if (!input) return [];
    if (Array.isArray(input)) return input;
    if (typeof input === "string") {
      // If it's a comma-separated string, split it
      if (input.includes(",")) return input.split(",").map((r) => r.trim());
      // If it's a single string, make it an array
      return [input];
    }
    return [];
  };

  const formattedRequirements = formatList(requirements);

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="h-full bg-gray-900/50 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 border border-blue-500/10"
    >
      <div className="p-6 flex flex-col h-full">
        <div className="flex-1">
          {/* Header Section */}
          <div className="flex flex-col gap-3 mb-4">
            <div className="flex items-start justify-between gap-4">
              <StreamingText
                text={title || "Scholarship Title"}
                className="text-xl font-semibold text-blue-200 line-clamp-2"
                speed={20}
              />
            </div>
            {amount && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-500/10 text-green-400 shrink-0">
                <StreamingText text={amount} speed={15} />
              </span>
            )}
            {institution && (
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
                <StreamingText
                  text={institution}
                  className="line-clamp-1"
                  speed={15}
                />
              </div>
            )}
          </div>

          <div className="space-y-4">
            {/* Description */}
            {description && (
              <StreamingText
                text={description}
                className="text-gray-300 text-sm line-clamp-3"
                speed={10}
              />
            )}

            {/* Details Section */}
            <div className="flex flex-col gap-3">
              {/* Eligibility */}
              {eligibility && (
                <div className="flex items-start gap-2">
                  <div className="w-5 h-5 mt-1 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-3 h-3 text-blue-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <span className="text-xs text-blue-300 block mb-1">
                      Eligibility
                    </span>
                    <StreamingText
                      text={eligibility}
                      className="text-sm text-gray-300"
                      speed={15}
                    />
                  </div>
                </div>
              )}

              {/* Deadline */}
              {deadline && (
                <div className="flex items-start gap-2">
                  <div className="w-5 h-5 mt-1 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-3 h-3 text-blue-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <StreamingText
                    text={`Deadline: ${deadline}`}
                    className="text-sm text-blue-300 flex-1"
                    speed={15}
                  />
                </div>
              )}

              {/* Requirements */}
              {formattedRequirements.length > 0 && (
                <div className="mt-2">
                  <h4 className="text-sm font-medium text-blue-300 mb-2">
                    Requirements
                  </h4>
                  <ul className="list-disc list-inside text-sm text-gray-300 space-y-1">
                    {formattedRequirements.map((req, index) => (
                      <li key={index} className="line-clamp-1">
                        <StreamingText text={req} speed={15} />
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Apply Button */}
        {applicationLink && (
          <div className="mt-6 pt-4 border-t border-gray-700">
            <motion.a
              href={applicationLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Apply Now
              <IconExternalLink className="ml-2 -mr-1 h-4 w-4" />
            </motion.a>
          </div>
        )}
      </div>
    </motion.div>
  );
};
