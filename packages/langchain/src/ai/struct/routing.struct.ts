import { z } from "zod";
import { StructuredOutputParser } from "langchain/output_parsers"

export const catchIntention = (intentions: string[], description?: string) => z.object({
    intention: z.enum(intentions as any)
        .describe(description || 'Categorize the following conversation and decide what the intention is')
})
.describe('You should structure it in the best way, do not alter or edit anything')


// NOTE: Only used for llm that no has withStructuredOutput method
export const formatInstructionRouting = (intentions: string[], description?: string) => 
    new StructuredOutputParser(catchIntention(intentions, description)).getFormatInstructions()