import { addKeyword } from "@bot-whatsapp/bot";

// opts = ['vendedor'], { sensitive: true } esto debe ser el valor por defecto pero que pueda sobreescribirse

const humanFlow = (humanCb: () => Promise<void>) => {
    return addKeyword('agente')
        .addAction(async (_, { flowDynamic }) => {
            await humanCb()
            return flowDynamic(`En breve un agente de nuestra tienda se comunicará contigo...`)
        })
}

export { humanFlow }