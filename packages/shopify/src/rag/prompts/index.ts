import { PromptTemplate } from "@langchain/core/prompts";
export * from "./closer/prompt";
export * from "./seller/prompt";
export * from "./info/prompt";

export const CONDENSE_QUESTION_PROMPT = PromptTemplate.fromTemplate(`Given the following conversation and a follow up question, rephrase the follow up question to be a standalone question, in its original language.

Chat History:
{chat_history}
Follow Up Input: {question}
Standalone question:`
);