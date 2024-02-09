import { BotContext, BotMethods } from "@bot-whatsapp/bot/dist/types";

export default async (ctx: BotContext, options: BotMethods) => {
    const history = options.state.get<{ role: 'user' | 'assisten', content: string }[]>('history') ?? []
    history.push({
        role: 'user',
        content: ctx.body
    })
    await options.state.update({ history })
}