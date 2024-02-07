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
            await flowDynamic(message)
            return
        })
}

export { sellerFlow }