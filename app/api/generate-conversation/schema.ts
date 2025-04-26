import { z } from "zod";

export const conversationSchema = z.object({
  conversation: z.object({
    agent1Id: z.string().describe("ID of the first agent in the conversation"),
    agent2Id: z.string().describe("ID of the second agent in the conversation"),
    messages: z
      .array(
        z.object({
          agentId: z.string().describe("ID of the agent speaking"),
          text: z.string().describe("The message content"),
        })
      )
      .describe(
        "Array of messages exchanged in the conversation, should be 6 messages total"
      ),
  }),
});

export type Conversation = z.infer<typeof conversationSchema>["conversation"];
