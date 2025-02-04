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

function sendEvent(
  data: Record<string, unknown> | string[] | string,
  eventType: string
) {
  return `event: ${eventType}\ndata: ${JSON.stringify(data)}\n\n`;
}

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

              // Start AI processing
              const resultPromise = generateScholarshipSearch({
                ...params,
                searchResults,
              });

              // Send a processing status immediately
              controller.enqueue(
                new TextEncoder().encode(
                  sendEvent({ status: "processing" }, "status")
                )
              );

              // Wait for AI response
              const result = await resultPromise;
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

              // Process scholarships in batches of 3 for better performance
              const scholarships = validatedResponse.data.scholarships;
              const batchSize = 3;

              for (let i = 0; i < scholarships.length; i += batchSize) {
                const batch = scholarships.slice(i, i + batchSize);
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
                if (i + batchSize < scholarships.length) {
                  await new Promise((resolve) => setTimeout(resolve, 50));
                }
              }

              // Send recommendations and resources together if available
              const finalDataPromises = [];

              if (validatedResponse.data.recommendations) {
                finalDataPromises.push(
                  controller.enqueue(
                    new TextEncoder().encode(
                      sendEvent(
                        validatedResponse.data.recommendations,
                        "recommendations"
                      )
                    )
                  )
                );
              }

              if (validatedResponse.data.additionalResources) {
                finalDataPromises.push(
                  controller.enqueue(
                    new TextEncoder().encode(
                      sendEvent(
                        validatedResponse.data.additionalResources,
                        "resources"
                      )
                    )
                  )
                );
              }

              // Wait for all final data to be sent
              await Promise.all(finalDataPromises);

              // Send completion event
              controller.enqueue(
                new TextEncoder().encode(
                  sendEvent({ status: "complete" }, "complete")
                )
              );
            } catch (error) {
              // Send error event if something fails
              controller.enqueue(
                new TextEncoder().encode(
                  sendEvent(
                    {
                      error:
                        error instanceof Error
                          ? error.message
                          : "Unknown error",
                      status: "error",
                    },
                    "error"
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
    return NextResponse.json(
      {
        error: "Failed to process request",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
