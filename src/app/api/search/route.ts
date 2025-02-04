import { NextResponse } from "next/server";
import { generateScholarshipSearch, validateResponse } from "@/utils/ai-config";
import { ScholarshipSearchParams } from "@/types";

const SEARCH_STEPS = [
  "Analyzing student background",
  "Searching scholarship databases",
  "Matching eligibility criteria",
  "Verifying deadlines",
  "Generating recommendations",
  "Preparing additional resources",
];

export async function POST(req: Request) {
  try {
    const body: ScholarshipSearchParams = await req.json();
    const { caste, religion, state, educationLevel } = body;

    // Format the state and education level for the prompt
    const stateText = state ? `State: ${state}` : "";
    const educationLevelText = educationLevel
      ? `Education Level: ${educationLevel}`
      : "";

    // Call the Gemini API directly
    const result = await generateScholarshipSearch({
      caste,
      religion,
      state: stateText,
      educationLevel: educationLevelText,
    });

    // Validate and parse the AI response
    const validatedResponse = validateResponse(result);

    if (!validatedResponse.isValid) {
      throw new Error("Failed to parse AI response");
    }

    const { scholarships, summary, recommendations, additionalResources } =
      validatedResponse.data;

    return NextResponse.json({
      scholarships,
      summary,
      recommendations,
      additionalResources,
      searchSteps: SEARCH_STEPS,
    });
  } catch (error) {
    console.error("Error in scholarship search:", error);
    return NextResponse.json(
      {
        error: "Failed to search for scholarships",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
