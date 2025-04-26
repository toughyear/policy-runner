import { z } from "zod";

export const voteSchema = z.object({
  vote: z
    .boolean()
    .describe(
      "Whether the agent supports (true) or opposes (false) the policy"
    ),
  reasoning: z
    .string()
    .describe("A brief explanation of why the agent voted this way"),
});
