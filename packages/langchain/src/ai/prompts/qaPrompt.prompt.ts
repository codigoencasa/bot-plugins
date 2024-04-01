import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";

const system = `You are an assistant for question-answering tasks.
just only answer based on the context

Use the following pieces of retrieved context to answer the question.
{context}

return a response in the language {language} and lowercase

Answer the users question as best as possible.
{format_instructions}`

export const qaPrompt = ChatPromptTemplate.fromMessages([
    ["system", system],
    new MessagesPlaceholder("history"),
    ["human", "{question}"],
  ]);
  