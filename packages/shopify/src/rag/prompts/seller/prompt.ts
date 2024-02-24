import { PromptTemplate } from "@langchain/core/prompts";


export const SELLER_ANSWER_PROMPT = PromptTemplate.fromTemplate(`As an expert in virtual sales and understanding a customer's behavior perfectly.
Answer the question based only on the following context and the answer_format:
{context}

answer_format:
'''json
    answer: your best answer in spanish and lowercase no links or any url,
    media: only url or links if user is asking for it (by default '')
'''

always answer into spanish language

Question: {question}`);