import 'dotenv/config'
import { createBot, MemoryDB, createProvider, addKeyword, createFlow, EVENTS } from '@bot-whatsapp/bot'
import { createShopifyFlow } from '@builderbot-plugins/shopify'
import { TelegramProvider } from '@builderbot-plugins/telegram'
import { FreeGPT } from "@builderbot-plugins/free-gpt"

const main = async () => {

    const provider = createProvider(TelegramProvider)

    const { flow } = await createShopifyFlow(null, {
        modelInstance: new FreeGPT('GPT-4 Turbo'),
        storeInformation: {
            name: 'Juan estore',
            country: 'puerto cabello',
            province: 'Carabobo',
            city: 'puerto cabello',
            zip: '2050',
            currency: 'USD',
            email: 'miStore.contacto@gmail.com',
            bussiness_hours: 'atendemos solo los dias de semana de 9 a.m hasta las 5 p.m horas en horario America/Caracas'
        }
    })

    await createBot({
        database: new MemoryDB(),
        provider,
        flow: createFlow(flow)
    })

}

main()