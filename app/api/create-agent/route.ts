import { openai } from "@ai-sdk/openai";
import { streamObject } from "ai";
import { generateRandomAgentTraits } from "../../../utils/agent-traits";
import { agentSchema } from "./schema";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  // Generate random traits for the agent
  const traits = generateRandomAgentTraits();

  const result = streamObject({
    model: openai("gpt-4o-mini"),
    temperature: 1,
    system:
      "You are a character and personality generator for a policy simulation. " +
      "You will be given a set of personality traits and should generate a realistic and diverse character " +
      "that accurately reflects Indian demographics. Generate nuanced, complex individuals with " +
      "realistic backgrounds, motivations, and memories. " +
      "The character should feel like a real person with a unique personality, " +
      "not a stereotype or caricature. " +
      "The current date is: " +
      new Date()
        .toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "2-digit",
        })
        .replace(/(\w+) (\d+), (\d+)/, "$3-$1-$2"),
    prompt: `Create a person with the following traits:
      Religion: ${traits.religion}
      Anger Level: ${traits.anger.toFixed(2)} (0-1 scale)
      Persuasiveness: ${traits.persuasiveness.toFixed(2)} (0-1 scale)
      Gullibility: ${traits.gullibility.toFixed(2)} (0-1 scale)
      Income Level: ${traits.income.toFixed(2)} (0-1 scale)
      
      Generate an authentic and realistic Indian character with these traits. 
      Include a name, background story, and three impactful memories the character has.`,
    schema: agentSchema,
    onFinish({ object }) {
      // Could be used to save to a database
      console.log("Agent created:", object);
    },
  });

  return result.toTextStreamResponse();
}
