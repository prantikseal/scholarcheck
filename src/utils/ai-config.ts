import { GoogleGenerativeAI } from "@google/generative-ai";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { RunnableSequence } from "@langchain/core/runnables";

if (!process.env.NEXT_PUBLIC_GOOGLE_API_KEY) {
  throw new Error("Missing NEXT_PUBLIC_GOOGLE_API_KEY environment variable");
}

export const genAI = new GoogleGenerativeAI(
  process.env.NEXT_PUBLIC_GOOGLE_API_KEY
);

export const scholarshipModel = new ChatGoogleGenerativeAI({
  modelName: "gemini-1.5-flash",
  maxOutputTokens: 4096,
  apiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY,
});

const searchTemplate = `You are an expert scholarship search assistant. Your task is to analyze student backgrounds and find relevant scholarships.

Student Background:
Caste: {caste}
Religion: {religion}
{state}
{educationLevel}

Instructions:
1. Analyze the student's background considering:
   - Caste-based reservations and schemes
   - Religious minority scholarships
   - State-specific opportunities
   - Education level requirements

2. Search across multiple sources:
   - Government scholarships (Central & State)
   - Private institutions
   - NGOs and foundations
   - Educational institutions

3. Verify and validate:
   - Eligibility criteria
   - Application deadlines
   - Documentation requirements
   - Selection process

Please format the response in the following JSON structure:
{{
  "scholarships": [
    {{
      "title": "Scholarship Name",
      "institution": "Provider Name",
      "description": "Detailed description including benefits",
      "eligibility": "Complete eligibility criteria",
      "amount": "Scholarship amount and duration",
      "deadline": "Application deadline",
      "applicationLink": "URL to apply",
      "requirements": ["Required document 1", "Required document 2"],
      "selectionProcess": "Selection process details"
    }}
  ],
  "summary": "A comprehensive summary of the search results",
  "recommendations": [
    "Specific recommendation 1",
    "Specific recommendation 2"
  ],
  "additionalResources": [
    {{
      "title": "Resource name",
      "description": "How this can help",
      "link": "URL to resource"
    }}
  ]
}}`;

export const searchPrompt = PromptTemplate.fromTemplate(searchTemplate);

export const outputParser = new StringOutputParser();

export const scholarshipChain = RunnableSequence.from([
  searchPrompt,
  scholarshipModel,
  outputParser,
]);

// Helper function to validate JSON response
export const validateResponse = (response: string) => {
  try {
    // Remove markdown code block markers if present
    const cleanResponse = response.replace(/```json\n?|\n?```/g, "").trim();
    const parsed = JSON.parse(cleanResponse);
    return {
      isValid: true,
      data: parsed,
    };
  } catch (error) {
    console.error("Error parsing AI response:", error);
    return {
      isValid: false,
      data: null,
    };
  }
};

export const scholarshipPrompt = `You are a helpful AI assistant that helps students find relevant scholarships. 
Given a student's caste and religious background, you will help find appropriate scholarships across local, government, and state institutions.
Please provide detailed information about eligibility, application process, and deadlines when available.
Format the response in a clear, structured way.`;

// Add interfaces for Google Search results
interface GoogleSearchResult {
  title: string;
  link: string;
  snippet?: string;
}

interface GoogleSearchItem {
  title: string;
  link: string;
  snippet?: string;
  pagemap?: {
    metatags?: Array<{ [key: string]: string }>;
  };
}

interface GoogleSearchResponse {
  items?: GoogleSearchItem[];
  searchInformation?: {
    totalResults: string;
  };
}

// Add Google Search integration
async function searchGoogle(query: string): Promise<GoogleSearchResult[]> {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_SEARCH_API_KEY;
  const searchEngineId = process.env.NEXT_PUBLIC_GOOGLE_CSE_ID;

  if (!apiKey || !searchEngineId) {
    console.error("Missing Google API key or Search Engine ID");
    return [];
  }

  try {
    const params = new URLSearchParams({
      key: apiKey,
      cx: searchEngineId,
      q: query,
      num: "10", // Maximum results per page
      safe: "active", // Safe search setting
      gl: "in", // Geolocation set to India for more relevant results
      cr: "countryIN", // Country restrict to India
      lr: "lang_en", // Language restrict to English
      sort: "date", // Sort by date to get recent scholarships
    });

    const response = await fetch(
      `https://customsearch.googleapis.com/customsearch/v1?${params.toString()}`
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Google Search API Error:", errorData);
      throw new Error(
        errorData.error?.message || "Failed to fetch search results"
      );
    }

    const data: GoogleSearchResponse = await response.json();

    if (!data.items || data.items.length === 0) {
      console.log("No search results found");
      return [];
    }

    // Map and clean the results
    return data.items
      .map((item: GoogleSearchItem) => ({
        title: item.title?.replace(/\s+/g, " ").trim() || "",
        link: item.link || "",
        snippet: item.snippet?.replace(/\s+/g, " ").trim() || "",
      }))
      .filter(
        (result) =>
          // Filter out results that don't have both title and link
          result.title && result.link
      );
  } catch (error) {
    console.error("Error searching Google:", error);
    return [];
  }
}

// Updated API call function using the official SDK
export const generateScholarshipSearch = async (params: {
  caste: string;
  religion: string;
  state: string;
  educationLevel: string;
}) => {
  try {
    // First, get relevant search results
    const searchQuery = `${params.caste} ${params.religion} scholarships in ${params.state} for ${params.educationLevel}`;
    const searchResults = await searchGoogle(searchQuery);

    console.log("Search Results:", searchResults);

    const model = genAI.getGenerativeModel({
      model: "gemini-pro",
      generationConfig: {
        temperature: 0.7,
        topK: 1,
        topP: 1,
        maxOutputTokens: 4096,
      },
    });

    // Add search results to the prompt
    const prompt = `You are an expert scholarship search assistant. Your task is to analyze student backgrounds and find relevant scholarships.
IMPORTANT: Respond with a raw JSON object, do not wrap it in markdown code blocks.

Student Background:
Caste: ${params.caste}
Religion: ${params.religion}
${params.state}
${params.educationLevel}

Recent Search Results:
${searchResults
  .map((item: GoogleSearchResult) => `- ${item.title}: ${item.link}`)
  .join("\n")}

Instructions:
1. Analyze the student's background considering:
   - Caste-based reservations and schemes
   - Religious minority scholarships
   - State-specific opportunities
   - Education level requirements

2. Search across multiple sources:
   - Government scholarships (Central & State)
   - Private institutions
   - NGOs and foundations
   - Educational institutions
   - Include relevant links from the search results above

3. Verify and validate:
   - Eligibility criteria
   - Application deadlines
   - Documentation requirements
   - Selection process

Please format the response in the following JSON structure:
{
  "scholarships": [
    {
      "title": "Scholarship Name",
      "institution": "Provider Name",
      "description": "Detailed description including benefits",
      "eligibility": "Complete eligibility criteria",
      "amount": "Scholarship amount and duration",
      "deadline": "Application deadline",
      "applicationLink": "URL to apply (use verified links from search results when available)",
      "requirements": ["Required document 1", "Required document 2"],
      "selectionProcess": "Selection process details",
      "background": "Target background information"
    }
  ],
  "summary": "A comprehensive summary of the search results",
  "recommendations": [
    "Specific recommendation 1",
    "Specific recommendation 2"
  ],
  "additionalResources": [
    {
      "title": "Resource name",
      "description": "How this can help",
      "link": "URL to resource (prefer verified links from search results)"
    }
  ]
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Log the response for debugging
    console.log("Gemini API Response:", text);

    return text;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw error;
  }
};

// Add parseQueryToJSON function
export const parseQueryToJSON = async (query: string) => {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-pro",
      generationConfig: {
        temperature: 0.1, // Low temperature for more precise output
        topK: 1,
        topP: 1,
        maxOutputTokens: 1024,
      },
    });

    const prompt = `Convert the following scholarship search query into a structured JSON format.
Extract caste (SC/ST/OBC/General), religion, state/city, and education level.

Input query: "${query}"

Respond ONLY with a JSON object in this exact format (no other text):
{
  "caste": "extracted caste or empty string",
  "religion": "extracted religion or empty string",
  "state": "extracted state/city or empty string",
  "educationLevel": "extracted education level or empty string"
}

Example:
For input "Find scholarships for Hindu SC students in engineering in kolkata"
Output should be:
{
  "caste": "SC",
  "religion": "Hindu",
  "state": "kolkata",
  "educationLevel": "engineering"
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse the response into JSON
    const parsedData = JSON.parse(text);
    return parsedData;
  } catch (error) {
    console.error("Error parsing query:", error);
    throw error;
  }
};
