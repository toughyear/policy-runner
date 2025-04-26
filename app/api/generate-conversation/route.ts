import { openai } from "@ai-sdk/openai";
import { streamObject } from "ai";
import { NextResponse } from "next/server";
import { conversationSchema } from "./schema";

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { agent1, agent2, policy } = await req.json();

    if (!agent1 || !agent2 || !policy) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    const result = streamObject({
      model: openai("gpt-4o-mini"),
      temperature: 0.7,
      system: `You are simulating a conversation between two people about a government policy. 
          
Person 1 is named ${agent1.name}, with this background: "${agent1.background}"
Their traits: Religion: ${agent1.traits.religion}, Anger level: ${
        agent1.traits.anger
      }/1, Persuasiveness: ${agent1.traits.persuasiveness}/1, Gullibility: ${
        agent1.traits.gullibility
      }/1, Income level: ${agent1.traits.income}/1
Their memories: ${agent1.memories.join("; ")}

Person 2 is named ${agent2.name}, with this background: "${agent2.background}"
Their traits: Religion: ${agent2.traits.religion}, Anger level: ${
        agent2.traits.anger
      }/1, Persuasiveness: ${agent2.traits.persuasiveness}/1, Gullibility: ${
        agent2.traits.gullibility
      }/1, Income level: ${agent2.traits.income}/1
Their memories: ${agent2.memories.join("; ")}

The policy they are discussing is: "${policy}"

Generate a realistic 3-turn conversation between them about this policy, where each responds based on their background, traits, and memories. 
Person 1 starts the conversation by bringing up the policy.
Each person should speak once per turn, for a total of 6 messages (3 from each person).
Each person should express opinions consistent with their background, traits and memories.`,
      prompt: `Generate a conversation between ${agent1.name} and ${agent2.name} about the policy: "${policy}"`,
      schema: conversationSchema,
      onFinish({ object }) {
        console.log("Conversation generated");
      },
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("Error generating conversation:", error);
    return NextResponse.json(
      { error: "Failed to generate conversation" },
      { status: 500 }
    );
  }
}
