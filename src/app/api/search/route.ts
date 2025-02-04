import { NextResponse } from "next/server";
import {
  generateScholarshipSearch,
  validateResponse,
  parseQueryToJSON,
  searchGoogle,
} from "@/utils/ai-config";
import { Scholarship } from "@/types";
// import { ScholarshipSearchParams } from "@/types";

// const SEARCH_STEPS = [
//   "Analyzing student background",
//   "Searching scholarship databases",
//   "Matching eligibility criteria",
//   "Verifying deadlines",
//   "Generating recommendations",
//   "Preparing additional resources",
// ];

// Constants
const REQUIRED_PARAMS = ["caste", "religion", "state", "educationLevel"];
const BATCH_SIZE = 2; // Reduced batch size
const BATCH_DELAY = 30; // Reduced delay between batches
const MAX_TIMEOUT = 20000; // 20 seconds max timeout

function sendEvent(
  data: Record<string, unknown> | string[] | string,
  eventType: string
) {
  return `event: ${eventType}\ndata: ${JSON.stringify(data)}\n\n`;
}

// Timeout promise
const timeoutPromise = (ms: number) =>
  new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error("Operation timed out")), ms)
  );

// Race promise with timeout
const withTimeout = <T>(promise: Promise<T>, ms: number): Promise<T> =>
  Promise.race([promise, timeoutPromise(ms)]);

// Step 1: Parse natural language query
export async function POST(req: Request) {
  try {
    // Read the request body once
    const body = await req.json();
    const { searchType } = body;

    switch (searchType) {
      case "parseQuery": {
        const { query } = body;
        const parsedQuery = await withTimeout(
          parseQueryToJSON(query),
          MAX_TIMEOUT
        );
        const missingParams = REQUIRED_PARAMS.filter(
          (param) => !parsedQuery[param]
        );

        return NextResponse.json({
          success: true,
          data: parsedQuery,
          missingParams,
        });
      }

      case "searchWeb": {
        const { params } = body;
        const searchQuery = `${params.caste} ${params.religion} scholarships in ${params.state} for ${params.educationLevel}`;
        const searchResults = await withTimeout(
          searchGoogle(searchQuery),
          MAX_TIMEOUT
        );
        return NextResponse.json({ success: true, data: searchResults });
      }

      case "generateResults": {
        const { params, searchResults } = body;

        // Create a streaming response using Server-Sent Events
        const stream = new ReadableStream({
          async start(controller) {
            try {
              // Send initial connection event
              controller.enqueue(
                new TextEncoder().encode(
                  sendEvent({ status: "connected" }, "connect")
                )
              );

              // Start AI processing with timeout
              const resultPromise = generateScholarshipSearch({
                ...params,
                searchResults,
              });

              // Send processing status
              controller.enqueue(
                new TextEncoder().encode(
                  sendEvent({ status: "processing" }, "status")
                )
              );

              // Wait for AI response with timeout
              const result = await withTimeout(resultPromise, MAX_TIMEOUT);
              const validatedResponse = validateResponse(result);

              if (!validatedResponse.isValid) {
                throw new Error("Failed to parse AI response");
              }

              // Send summary immediately
              controller.enqueue(
                new TextEncoder().encode(
                  sendEvent(validatedResponse.data.summary, "summary")
                )
              );

              // Process scholarships in smaller batches with shorter delays
              const scholarships = validatedResponse.data.scholarships;

              for (let i = 0; i < scholarships.length; i += BATCH_SIZE) {
                const batch = scholarships.slice(i, i + BATCH_SIZE);

                // Process batch concurrently
                await Promise.all(
                  batch.map(async (scholarship: Scholarship) => {
                    controller.enqueue(
                      new TextEncoder().encode(
                        sendEvent(
                          JSON.parse(JSON.stringify(scholarship)),
                          "scholarship"
                        )
                      )
                    );
                  })
                );

                // Smaller delay between batches
                if (i + BATCH_SIZE < scholarships.length) {
                  await new Promise((resolve) =>
                    setTimeout(resolve, BATCH_DELAY)
                  );
                }
              }

              // Send remaining data concurrently
              await Promise.all([
                validatedResponse.data.recommendations &&
                  controller.enqueue(
                    new TextEncoder().encode(
                      sendEvent(
                        validatedResponse.data.recommendations,
                        "recommendations"
                      )
                    )
                  ),
                validatedResponse.data.additionalResources &&
                  controller.enqueue(
                    new TextEncoder().encode(
                      sendEvent(
                        validatedResponse.data.additionalResources,
                        "resources"
                      )
                    )
                  ),
              ]);

              // Send completion event
              controller.enqueue(
                new TextEncoder().encode(
                  sendEvent({ status: "complete" }, "complete")
                )
              );
            } catch (error) {
              // Handle timeout and other errors
              const errorMessage =
                error instanceof Error ? error.message : "Unknown error";
              const errorType =
                error instanceof Error &&
                error.message === "Operation timed out"
                  ? "timeout"
                  : "error";

              controller.enqueue(
                new TextEncoder().encode(
                  sendEvent(
                    {
                      error: errorMessage,
                      status: errorType,
                    },
                    errorType
                  )
                )
              );
            } finally {
              controller.close();
            }
          },
        });

        return new Response(stream, {
          headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            Connection: "keep-alive",
            "Access-Control-Allow-Origin": "*",
          },
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
    const isTimeout =
      error instanceof Error &&
      (error.message === "Operation timed out" ||
        error.message === "socket hang up");

    return NextResponse.json(
      {
        error: isTimeout
          ? "Request timed out. Please try again."
          : "Failed to process request",
        details: error instanceof Error ? error.message : "Unknown error",
        type: isTimeout ? "timeout" : "error",
      },
      { status: isTimeout ? 408 : 500 }
    );
  }
}
