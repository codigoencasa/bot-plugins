import 'dotenv/config'
import { createBot, MemoryDB, createProvider, addKeyword, createFlow, EVENTS } from '@bot-whatsapp/bot'
import { createShopifyFlow } from '@builderbot-plugins/shopify'
import { TelegramProvider } from '@builderbot-plugins/telegram'
import { FreeGPT as GPT } from "@builderbot-plugins/free-gpt"

const main = async () => {
    const { flow } = await createShopifyFlow(null, {
        modelInstance: new GPT('gpt-3.5-turbo'),
        language: 'english',
        storeInformation: {
            name: 'Juan estore',
            country: 'venezuela',
            email: 'miStore.contacto@gmail.com',
            bussiness_hours: 'atendemos solo los dias de semana de 9 a.m hasta las 5 p.m horas'
        }
    })

    await createBot({
        database: new MemoryDB(),
        provider: createProvider(TelegramProvider),
        flow: createFlow(flow)
    })

}

main()