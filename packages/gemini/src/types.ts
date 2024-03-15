import { BotContext, BotMethods } from "@bot-whatsapp/bot/dist/types"

export type Context = {
    [key: string]: string
}

export type AnyBot = [[BotContext, BotMethods]]
export type GeminiOpts = { 
    vision?: boolean;
    visionPrompt?: string;
    context: Context;
    extra?: {
        maxOutputTokens: number;
        temperature: number;
        topK: number;
        topP: number;
    },
    cb?: (ctx: BotContext, methods: BotMethods) => Promise<void>
}
