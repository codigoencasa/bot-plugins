import 'dotenv/config'
import { createBot, MemoryDB, createProvider, addKeyword, createFlow } from '@bot-whatsapp/bot'
import { createShopifyFlow } from '@builderbot-plugins/shopify'
import { TelegramProvider } from '@builderbot-plugins/telegram'

const main = async () => {
    const provider = createProvider(TelegramProvider, { token: process.env.TELEGRAM_API ?? '' })

    const flow = await createShopifyFlow({
        openApiKey: process.env.OPEN_API_KEY ?? '',
        shopifyApiKey: process.env.SHOPIFY_API_KEY ?? '',
        shopifyDomain: 'electonicos-2025.myshopify.com',
        modelName: 'gpt-3.5-turbo'
    })

    const flowDemo = addKeyword('pepe').addAnswer('fdff')

    await createBot({
        database: new MemoryDB(),
        provider,
        flow: createFlow(flow.concat(flowDemo))
    })


}
main()