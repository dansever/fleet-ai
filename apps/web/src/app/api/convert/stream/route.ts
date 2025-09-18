import { createImprovedUOMAgent } from '@/agents/tools/uomAgent';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { input } = await request.json();

    if (!input || typeof input !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Invalid input. Please provide a conversion request.' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }

    // Create a readable stream for the response
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();

        try {
          // Send initial status
          controller.enqueue(
            encoder.encode(
              'data: {"status": "processing", "message": "Analyzing your request..."}\n\n',
            ),
          );

          // Create the agent
          const executor = await createImprovedUOMAgent();

          // Send progress update
          controller.enqueue(
            encoder.encode(
              'data: {"status": "converting", "message": "Performing conversion..."}\n\n',
            ),
          );

          // Execute the conversion
          const result = await executor.invoke({ input });

          // Debug logging
          console.log('Agent result:', JSON.stringify(result, null, 2));

          // Extract the actual tool result from the agent output
          let finalResult = result.output;

          // Check if the agent actually called a tool and got results
          if (result.intermediateSteps && result.intermediateSteps.length > 0) {
            // Look for tool results in intermediate steps
            const lastStep = result.intermediateSteps[result.intermediateSteps.length - 1];
            if (lastStep.action && lastStep.observation) {
              try {
                // Try to parse the tool observation as JSON
                const toolResult = JSON.parse(lastStep.observation);
                finalResult = toolResult;
              } catch (parseError) {
                // If parsing fails, use the raw observation
                finalResult = lastStep.observation;
              }
            }
          } else if (typeof finalResult === 'string' && finalResult.includes('Agent stop')) {
            // Look for JSON in the output
            try {
              const jsonMatch = finalResult.match(/\{.*\}/s);
              if (jsonMatch) {
                finalResult = JSON.parse(jsonMatch[0]);
              } else {
                // If no JSON found, return an error
                finalResult = {
                  error: 'CONVERSION_ERROR',
                  message: 'Agent stopped without providing a valid result',
                  details: { input },
                };
              }
            } catch (parseError) {
              finalResult = {
                error: 'CONVERSION_ERROR',
                message: 'Failed to parse agent output',
                details: { input, rawOutput: finalResult },
              };
            }
          }

          // Send the final result
          const response = {
            status: 'completed',
            result: finalResult,
            timestamp: new Date().toISOString(),
          };

          controller.enqueue(encoder.encode(`data: ${JSON.stringify(response)}\n\n`));

          // Send completion signal
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        } catch (error: any) {
          // Send error response
          const errorResponse = {
            status: 'error',
            error: error.message || 'Conversion failed',
            timestamp: new Date().toISOString(),
          };

          controller.enqueue(encoder.encode(`data: ${JSON.stringify(errorResponse)}\n\n`));

          // Send completion signal even for errors
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  } catch (error: any) {
    return new Response(
      JSON.stringify({
        error: 'Server error',
        message: error.message,
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }
}
