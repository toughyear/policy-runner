import { openai } from "@ai-sdk/openai";
import { streamObject } from "ai";
import { NextResponse } from "next/server";
import { voteSchema } from "./schema";

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { agent, policy } = await req.json();

    if (!agent || !policy) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // Determine the agent's vote using LLM based on their traits and memories
    const result = streamObject({
      model: openai("gpt-4o-mini"),
      temperature: 1,
      system: `You are simulating a person's voting decision on a government policy. 
          
The person is named ${agent.name}, with this background: "${agent.background}"
Their traits: Religion: ${agent.traits.religion}, Anger level: ${
        agent.traits.anger
      }/1, Persuasiveness: ${agent.traits.persuasiveness}/1, Gullibility: ${
        agent.traits.gullibility
      }/1, Income level: ${agent.traits.income}/1
Their memories: ${agent.memories.join("; ")}

The policy they are voting on is: "${policy}"

Based on this person's background, traits, and memories, would they vote in support of this policy?
Your response must include a vote (true for support, false for opposition) and reasoning.`,
      prompt: `Should ${agent.name} vote in support of the policy: "${policy}"?`,
      schema: voteSchema,
      onFinish({ object }) {
        console.log(`Vote calculated for ${agent.name}`);
      },
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("Error calculating vote:", error);
    return NextResponse.json(
      { error: "Failed to calculate vote" },
      { status: 500 }
    );
  }
}
