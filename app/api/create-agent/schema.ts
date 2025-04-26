import { DeepPartial } from "ai";
import { z } from "zod";

export const agentSchema = z.object({
  agent: z.object({
    name: z.string().describe("Full name of the agent"),
    background: z
      .string()
      .describe(
        "A detailed background story of the agent, including their upbringing, social status, and key life events that shape their worldview"
      ),
    memories: z
      .array(z.string())
      .describe("Three core memories that this agent has"),
    traits: z.object({
      religion: z.string().describe("Religious affiliation of the agent"),
      anger: z.number().describe("Level of anger on a scale from 0 to 1"),
      persuasiveness: z
        .number()
        .describe("Level of persuasiveness on a scale from 0 to 1"),
      gullibility: z
        .number()
        .describe("Level of gullibility on a scale from 0 to 1"),
      income: z.number().describe("Level of income on a scale from 0 to 1"),
    }),
  }),
});

export type PartialAgent = DeepPartial<typeof agentSchema>["agent"];

export type Agent = z.infer<typeof agentSchema>["agent"];
