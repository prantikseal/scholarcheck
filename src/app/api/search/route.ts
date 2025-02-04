import { NextResponse } from "next/server";
import {
  generateScholarshipSearch,
  validateResponse,
  parseQueryToJSON,
  searchGoogle,
} from "@/utils/ai-config";
// import { ScholarshipSearchParams } from "@/types";

// const SEARCH_STEPS = [
//   "Analyzing student background",
//   "Searching scholarship databases",
//   "Matching eligibility criteria",
//   "Verifying deadlines",
//   "Generating recommendations",
//   "Preparing additional resources",
// ];

// Step 1: Parse natural language query
export async function POST(req: Request) {
  try {
    // Read the request body once
    const body = await req.json();
    const { searchType } = body;

    switch (searchType) {
      case "parseQuery": {
        const { query } = body;
        const parsedQuery = await parseQueryToJSON(query);
        return NextResponse.json({ success: true, data: parsedQuery });
      }

      case "searchWeb": {
        const { params } = body;
        const searchQuery = `${params.caste} ${params.religion} scholarships in ${params.state} for ${params.educationLevel}`;
        const searchResults = await searchGoogle(searchQuery);
        return NextResponse.json({ success: true, data: searchResults });
      }

      case "generateResults": {
        const { params, searchResults } = body;
        const result = await generateScholarshipSearch({
          ...params,
          searchResults,
        });
        const validatedResponse = validateResponse(result);

        if (!validatedResponse.isValid) {
          throw new Error("Failed to parse AI response");
        }

        return NextResponse.json({
          success: true,
          data: validatedResponse.data,
        });
      }

      default:
        return NextResponse.json(
          { error: "Invalid search type" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Error in scholarship search:", error);
    return NextResponse.json(
      {
        error: "Failed to process request",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
