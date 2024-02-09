import 'dotenv/config'
import { createBot, MemoryDB, createProvider, addKeyword, createFlow } from '@bot-whatsapp/bot'
import { createShopifyFlow } from '@builderbot-plugins/shopify'
import { TelegramProvider } from '@builderbot-plugins/telegram'

const main = async () => {
    const provider = createProvider(TelegramProvider, { token: '***' })

    const flow = await createShopifyFlow({
        openApiKey: 'sk-*************',
        shopifyApiKey: 'shpat_*****************',
        shopifyDomain: 'electonicos-2025.myshopify.com'
    })


    const demo = addKeyword('hola').addAnswer('Buenas')

    await createBot({
        database: new MemoryDB(),
        provider,
        flow: flow
    })
}
main()