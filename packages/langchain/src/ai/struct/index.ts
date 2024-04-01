import { ChatPromptTemplate } from '@langchain/core/prompts';
import { SYSTEM_STRUCT } from '../prompts';

export * from "./routing.struct"

export const PROMPT_STRUCT = ChatPromptTemplate.fromMessages([
    ["system", SYSTEM_STRUCT],
    ["human", "{question}"]
]);