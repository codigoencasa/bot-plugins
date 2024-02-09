import { EVENTS, addKeyword } from "@bot-whatsapp/bot";

/**
 * Este va ser el agente vendedor info muy basica del negocio
 * esto 
 * @returns 
 */

export default addKeyword(EVENTS.ACTION)
    .addAction(async (_, { flowDynamic, state }) => {
        console.log('voy aqui..')
        await flowDynamic('entre en el vendedor')

    })