import { PromptTemplate } from "@langchain/core/prompts";

export const CONDENSE_QUESTION_PROMPT = PromptTemplate.fromTemplate(
    `Dada la siguiente conversación y una pregunta de seguimiento, reformula la pregunta de seguimiento para que sea una pregunta independiente.
      Historial del chat:
      {chat_history}
      Pregunta de seguimiento: {question}
      Pregunta independiente:`
);