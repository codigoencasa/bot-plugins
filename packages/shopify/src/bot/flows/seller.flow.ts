import { EVENTS, addKeyword } from "@bot-whatsapp/bot";
import { generateTimer } from "../../utils/generateTimer";
import { handleHistory } from "../utils/handleHistory";

/**
 * Este va ser el agente vendedor info muy basica del negocio
 * esto 
 * @returns 
 */

export default addKeyword(EVENTS.ACTION)
    .addAction(async (_, { flowDynamic, state }) => {
        const agentMessage = state.get('lastMessageAgent') ?? ''
        await handleHistory({ content: agentMessage, role: 'seller' }, state)
        await flowDynamic([{ body: agentMessage, delay: generateTimer(150, 280) }]);

    })