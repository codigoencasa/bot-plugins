import { EVENTS, addKeyword } from "@bot-whatsapp/bot";

import { generateTimer } from "../../utils/generateTimer";

/**
 * Este va ser el agente vendedor info muy basica del negocio
 * esto 
 * @returns 
 */

export default addKeyword(EVENTS.ACTION)
    .addAction(async (_, { flowDynamic, state }) => {
        const agentMessage = state.get('lastMessageAgent') ?? ''
        await flowDynamic([{ body: 'entro al seller flow', delay: generateTimer(150, 280) }]);

    })