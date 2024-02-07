import { EVENTS, addKeyword } from "@bot-whatsapp/bot";

/**
 * Este va ser el agente vendedor info muy basica del negocio
 * esto 
 * @returns 
 */
const sellerFlow = () => {
    return addKeyword(EVENTS.ACTION)
        .addAction(async (_, { flowDynamic, state }) => {
            const message = state.get('lastMessageAgent') ?? ''
            const history = state.get<{ role: 'user' | 'assisten', content: string }[]>('history') ?? []
            history.push({
                role: 'assisten',
                content: message
            })
            await state.update({ history })
            await flowDynamic(message)
            return
        })
}

export { sellerFlow }