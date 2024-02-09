import 'dotenv/config'
import { createBot, MemoryDB, createProvider, addKeyword, createFlow, EVENTS } from '@bot-whatsapp/bot'
import { createShopifyFlow } from '@builderbot-plugins/shopify'
import { TelegramProvider } from '@builderbot-plugins/telegram'
import { init } from '@builderbot-plugins/openai-agents';
const employeesAddon = init({
    apiKey: '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',
    model: 'gpt-3.5-turbo',
    temperature: 0
});
const sellerFlow = () => {
    return addKeyword(EVENTS.ACTION).addAnswer('el vendedor entra')
}

const expertFlow = (a: any) => {
    return addKeyword(EVENTS.ACTION).addAnswer('el experto entra')
}

const welcomeFlow = (employees: any) => {
    return addKeyword(EVENTS.WELCOME).addAction(async (ctx, { gotoFlow, state, flowDynamic }) => {
        const incomingMessage = ctx.body //buenas me interesa el curso de nodejs
        const bestEmployee = await employees.determine(incomingMessage)

        if (!bestEmployee?.employee) {
            if (state.get('lastFlow')) return gotoFlow(state.get('lastFlow'))
            return flowDynamic('Ups lo siento no te entiendo ¿Como puedo ayudarte?') //esto luego puede ser un mensaje que se pueda custom por args

        }
        await state.update({ lastMessageAgent: `${bestEmployee?.answer}` })
        await state.update({ lastFlow: bestEmployee.employee.flow })

        return gotoFlow(bestEmployee.employee.flow)
    })
}

const main = async () => {
    const provider = createProvider(TelegramProvider, { token: '19677' })

    const flow = await createShopifyFlow({
        openApiKey: 'sk-',
        shopifyApiKey: 'shpat_',
        shopifyDomain: 'electonic',
        modelName: 'gpt-3.5-turbo'
    })


    const storeInfo = 'Electronicos 20030 ubicada en San Cristobal'

    const demo = addKeyword('hola').addAnswer('Buenas')

    console.log(`[flow]:`, flow)


    await createBot({
        database: new MemoryDB(),
        provider,
        flow: createFlow(flow)
    })
}
main()