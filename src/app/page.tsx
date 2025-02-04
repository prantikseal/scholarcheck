"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SearchAnimation } from "@/components/SearchAnimation";
import { ScholarshipCard } from "@/components/ScholarshipCard";
import { BackgroundBeams } from "@/components/ui/background-beams";
import { SparklesText } from "@/components/ui/sparkles";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { CardHoverEffect } from "@/components/ui/card-hover-effect";
import {
  IconSearch,
  IconSchool,
  IconBulb,
  IconCertificate,
  IconArrowRight,
} from "@tabler/icons-react";
import { StreamingText } from "@/components/StreamingText";
import { SearchQuestionnaire } from "@/components/SearchQuestionnaire";

// const SEARCH_STEPS = [
//   "Analyzing student background",
//   "Searching scholarship databases",
//   "Matching eligibility criteria",
//   "Verifying deadlines",
//   "Generating recommendations",
// ];

interface Scholarship {
  title: string;
  institution: string;
  description: string;
  eligibility: string;
  amount?: string;
  deadline?: string;
  applicationLink?: string;
  requirements?: string[];
  selectionProcess?: string;
  background?: string;
}

const EXAMPLE_QUERIES = [
  "Find scholarships for Hindu SC students in engineering in Karnataka",
  "Muslim OBC scholarships for medical studies in Maharashtra",
  "Christian minority scholarships in Maharashtra for postgraduate studies based on merit",
  "Buddhist student scholarships for postgraduate studies in Pune",
  "Scholarships for students with less income in Kolkata",
];

const FEATURES = [
  {
    icon: <IconSearch className="w-6 h-6" />,
    title: "Smart Search",
    description: "AI-powered search that understands your background and needs",
  },
  {
    icon: <IconSchool className="w-6 h-6" />,
    title: "Comprehensive Database",
    description:
      "Access scholarships from government, private, and institutional sources",
  },
  {
    icon: <IconBulb className="w-6 h-6" />,
    title: "Personalized Matches",
    description:
      "Get scholarships that match your unique profile and eligibility",
  },
  {
    icon: <IconCertificate className="w-6 h-6" />,
    title: "Verified Information",
    description:
      "Up-to-date details about deadlines, amounts, and application processes",
  },
];

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [summary, setSummary] = useState<string>("");
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [additionalResources, setAdditionalResources] = useState<
    Array<{
      title: string;
      description: string;
      link: string;
    }>
  >([]);
  const [searchResults, setSearchResults] = useState<
    Array<{
      title: string;
      link: string;
      snippet?: string;
    }>
  >([]);
  const [error, setError] = useState<string>("");
  const [showExamples, setShowExamples] = useState(true);
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [missingParams, setMissingParams] = useState<string[]>([]);
  const [parsedParams, setParsedParams] = useState<Record<string, string> | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError("");
    setScholarships([]);
    setSummary("");
    setRecommendations([]);
    setAdditionalResources([]);
    setSearchResults([]);
    setShowExamples(false);
    setShowQuestionnaire(false);
    setParsedParams(null);

    try {
      // Step 1: Parse the query
      setCurrentStep("Analyzing search query");
      const parseResponse = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          searchType: "parseQuery",
          query: searchQuery,
        }),
      });

      if (!parseResponse.ok) throw new Error("Failed to parse query");
      const { data: params, missingParams: missing } = await parseResponse.json();

      // If there are missing parameters, show the questionnaire
      if (missing && missing.length > 0) {
        setMissingParams(missing);
        setParsedParams(params);
        setShowQuestionnaire(true);
        setLoading(false);
        return;
      }

      await processSearch(params);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to search for scholarships"
      );
      console.error("Search error:", error);
      setLoading(false);
    }
  };

  const processSearch = async (params: Record<string, string>) => {
    try {
      // Step 2: Search the web
      setCurrentStep("Searching scholarship databases");
      const searchResponse = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          searchType: "searchWeb",
          params,
        }),
      });

      if (!searchResponse.ok) throw new Error("Failed to search web");
      const { data: webResults } = await searchResponse.json();
      setSearchResults(webResults);

      // Step 3: Generate final results with SSE
      setCurrentStep("Generating recommendations");
      const generateResponse = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          searchType: "generateResults",
          params,
          searchResults: webResults,
        }),
      });

      if (!generateResponse.ok) throw new Error("Failed to generate results");

      const reader = generateResponse.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) throw new Error("Failed to get response reader");

      let buffer = "";
      const processEvents = (chunk: string) => {
        const events = chunk.split("\n\n");
        buffer = events.pop() || "";

        for (const event of events) {
          const lines = event.split("\n");
          const eventType = lines[0].replace("event: ", "");
          const data = JSON.parse(lines[1].replace("data: ", ""));

          switch (eventType) {
            case "connect":
              console.log("Connected to SSE stream");
              break;
            case "summary":
              setSummary(data);
              break;
            case "scholarship":
              setScholarships(prev => [...prev, data]);
              break;
            case "recommendations":
              setRecommendations(data);
              break;
            case "resources":
              setAdditionalResources(data);
              break;
            case "complete":
              console.log("Stream complete");
              break;
          }
        }
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const fullChunk = buffer + chunk;
        processEvents(fullChunk);
      }

      if (buffer) processEvents(buffer);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to search for scholarships"
      );
      console.error("Search error:", error);
    } finally {
      setLoading(false);
      setCurrentStep("");
    }
  };

  const handleQuestionnaireComplete = async (answers: Record<string, string>) => {
    setShowQuestionnaire(false);
    setLoading(true);

    // Merge parsed params with questionnaire answers
    const finalParams = {
      ...parsedParams,
      ...answers,
    };

    await processSearch(finalParams);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white relative">
      <BackgroundBeams />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="text-center mb-16"
        >
          <SparklesText className="inline-block">
            <motion.h1
              variants={itemVariants}
              className="text-4xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-blue-600 mb-6"
            >
              ScholarCheck AI
            </motion.h1>
          </SparklesText>
          <motion.div variants={itemVariants} className="max-w-2xl mx-auto">
            <TextGenerateEffect
              words="Find scholarships tailored to your background using AI-powered search"
              className="text-xl text-blue-200"
            />
          </motion.div>
        </motion.div>

        <motion.form
          variants={containerVariants}
          initial="hidden"
          animate="show"
          onSubmit={handleSearch}
          className="max-w-3xl mx-auto space-y-8"
        >
          <motion.div variants={itemVariants} className="relative group">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-6 py-4 text-lg bg-gray-800/50 border-2 border-blue-500/20 rounded-2xl 
              focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 
              hover:border-blue-500/30 
              shadow-lg text-white placeholder-gray-400 pr-32 
              transition-all duration-300 ease-in-out
              backdrop-blur-sm"
              placeholder="Describe your background and education interests..."
              required
            />
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="absolute right-2 top-2 px-6 py-2 bg-blue-600 text-white rounded-xl 
              hover:bg-blue-700 transition-all duration-300 
              disabled:bg-blue-400 disabled:cursor-not-allowed
              shadow-lg hover:shadow-blue-500/20
              border border-blue-500/20 hover:border-blue-500/40"
            >
              <span className="flex items-center gap-2">
                {loading ? "Searching..." : "Search"}
                <IconArrowRight className="w-4 h-4" />
              </span>
            </motion.button>

            {/* Input highlight effect */}
            <div className="absolute inset-0 rounded-2xl bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          </motion.div>
        </motion.form>

        <AnimatePresence>
          {showExamples && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="mt-6 max-w-3xl mx-auto"
            >
              <p className="text-sm text-gray-400 mb-3">
                Example searches:
              </p>
              <div className="flex flex-wrap gap-2">
                {EXAMPLE_QUERIES.map((query, index) => (
                  <motion.button
                    key={index}
                    onClick={() => setSearchQuery(query)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="text-sm px-4 py-2 rounded-full bg-blue-500/10 text-blue-300 hover:bg-blue-500/20 transition-colors"
                  >
                    {query}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {!loading && !scholarships.length && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="mt-24"
            >
              <CardHoverEffect items={FEATURES} />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {loading && currentStep && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="mt-12"
            >
              <SearchAnimation
                currentStep={currentStep}
                // steps={SEARCH_STEPS}
                searchQuery={searchQuery}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-8 p-4 bg-red-500/10 text-red-400 rounded-lg max-w-2xl mx-auto border border-red-500/20"
            >
              <StreamingText text={error} speed={20} showCursor={false} />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {summary && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="mt-12 p-6 bg-blue-500/10 rounded-xl max-w-3xl mx-auto border border-blue-500/20"
            >
              <h2 className="text-xl font-semibold mb-2 text-blue-300">
                <StreamingText text="Summary" speed={20} showCursor={false} />
              </h2>
              <StreamingText
                text={summary}
                className="text-blue-200"
                speed={15}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {scholarships.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              className="mt-12"
            >
              <h2 className="text-2xl font-semibold mb-6 text-center text-blue-200">
                <StreamingText
                  text="Available Scholarships"
                  speed={20}
                  showCursor={false}
                />
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {scholarships.map((scholarship, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{
                      duration: 0.5,
                      delay: index * 0.1,
                    }}
                  >
                    <ScholarshipCard {...scholarship} />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {recommendations.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="mt-8 p-6 bg-blue-500/10 rounded-xl max-w-3xl mx-auto border border-blue-500/20"
            >
              <h2 className="text-xl font-semibold mb-4 text-blue-300">
                <StreamingText
                  text="Recommendations"
                  speed={20}
                  showCursor={false}
                />
              </h2>
              <ul className="space-y-2">
                {recommendations.map((recommendation, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start gap-3"
                  >
                    <span className="text-blue-400">•</span>
                    <StreamingText
                      text={recommendation}
                      className="text-blue-200"
                      speed={15}
                      showCursor={false}
                    />
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {additionalResources.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="mt-8 p-6 bg-blue-500/10 rounded-xl max-w-3xl mx-auto border border-blue-500/20"
            >
              <h2 className="text-xl font-semibold mb-4 text-blue-300">
                <StreamingText
                  text="Additional Resources"
                  speed={20}
                  showCursor={false}
                />
              </h2>
              <div className="grid gap-4">
                {additionalResources.map((resource, index) => (
                  <motion.a
                    key={index}
                    href={resource.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="block p-4 rounded-lg bg-blue-600/10 hover:bg-blue-600/20 transition-colors border border-blue-500/20"
                  >
                    <h3 className="text-lg font-medium text-blue-300 mb-2">
                      <StreamingText
                        text={resource.title}
                        speed={20}
                        showCursor={false}
                      />
                    </h3>
                    <StreamingText
                      text={resource.description}
                      className="text-sm text-blue-200"
                      speed={15}
                      showCursor={false}
                    />
                  </motion.a>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {searchResults.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="mt-8 p-6 bg-blue-500/10 rounded-xl max-w-3xl mx-auto border border-blue-500/20"
            >
              <h2 className="text-xl font-semibold mb-4 text-blue-300">
                <StreamingText
                  text="Search Results"
                  speed={20}
                  showCursor={false}
                />
              </h2>
              <div className="space-y-4">
                {searchResults.map((result, index) => (
                  <motion.a
                    key={index}
                    href={result.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="block p-4 rounded-lg bg-blue-600/10 hover:bg-blue-600/20 transition-colors"
                  >
                    <h3 className="text-lg font-medium text-blue-300 mb-2">
                      <StreamingText
                        text={result.title}
                        speed={20}
                        showCursor={false}
                      />
                    </h3>
                    {result.snippet && (
                      <StreamingText
                        text={result.snippet}
                        className="text-sm text-blue-200"
                        speed={15}
                        showCursor={false}
                      />
                    )}
                  </motion.a>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showQuestionnaire && (
            <SearchQuestionnaire
              missingParams={missingParams}
              onComplete={handleQuestionnaireComplete}
              onCancel={() => {
                setShowQuestionnaire(false);
                setLoading(false);
              }}
            />
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
