import { BotContext, BotMethods } from "@bot-whatsapp/bot/dist/types";

export default async (ctx: BotContext, options: BotMethods) => {
    /** aqui puede ir una peticion a supabase por nuestros usuarios */
    await options.flowDynamic("Hola!, parace que no me se tu nombre aún, ¿Como te llamas?")
}