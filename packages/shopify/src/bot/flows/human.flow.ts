import { EVENTS, addKeyword } from "@bot-whatsapp/bot";
import { ActionPropertiesKeyword } from "@bot-whatsapp/bot/dist/types";
import { Shopify } from "../../shopify";


// opts = ['vendedor'], { sensitive: true } esto debe ser el valor por defecto pero que pueda sobreescribirse

const humanFlow = (humanCb: () => Promise<void>) => {
    return addKeyword('agente')
        .addAction(async (_, { state, flowDynamic }) => {
            await humanCb()
            const currentState = state.getMyState()
            return flowDynamic(`En breve un agente de nuestra tienda se comunicará contigo...`)
        })
}

export { humanFlow }