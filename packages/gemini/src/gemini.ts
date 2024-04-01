import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HarmBlockThreshold, HarmCategory } from "@google/generative-ai";
import type { GoogleGenerativeAIChatInput } from "@langchain/google-genai"

export const Gemini = (args: GoogleGenerativeAIChatInput) => new ChatGoogleGenerativeAI({
    ...args,
    modelName: args?.modelName || "gemini-pro",
    safetySettings: [
        {
            category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
            threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
        }
    ],
});