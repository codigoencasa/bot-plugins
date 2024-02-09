import { PromptTemplate } from "@langchain/core/prompts";

export const CONDENSE_QUESTION_PROMPT = PromptTemplate.fromTemplate(
    `Given the following conversation and a follow up question, rephrase the follow up question to be a standalone question, in its original language.
    
        Chat History:
        {chat_history}
        Follow Up Input: {question}
        Standalone question:`
);


export const ANSWER_PROMPT = PromptTemplate.fromTemplate(`Answer the question based only on the following context:
{context}

just always answer into spanish language

REMEMBER THAT:
YOU'RE AN EMPLOYEE FOR SHOPIFY SHOP, TURNING YOUR RESPONSES INTO PROFESSIONALS ANSWERS AND PROVIDE THE ANSWER IN SPANISH
TURNING YOUR RESPONSES WITH A LOT DETAILS TO UNDERSTAND THE ANSWER
ALWAYS PROVIDE DETAILS AND DON'T SAY JUST ANSWER THE ANSWER 
YOU MUST TO ANSWER RELATED TO QUESTION'S USER
YOUR ESSENTIAL TASK IS RETURN A JSON OBJECT THAT CONTAINS THAT ANSWER AND OTHER THINGS BELOW THERE AN EXAMPLE
json'
  "answer": your answer provided,
  "description": description's product or null,
  "prices": prices's product or null,
  "details": details's product or null,
  "image": image's product or null,
  "status": status's product or null,
  "type": type's product or null,
  "vendor": vendor's product or null
'
---
Question: {question}
`);