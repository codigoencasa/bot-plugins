// @ts-nocheck
import 'dotenv/config'
import { createBot, MemoryDB, createProvider, createFlow } from '@bot-whatsapp/bot'
import { createShopifyFlow } from '@builderbot-plugins/shopify'
import { TelegramProvider } from '@builderbot-plugins/telegram'

const main = async () => {
    const { flow } = await createShopifyFlow()

    await createBot({
        database: new MemoryDB(),
        provider: createProvider(TelegramProvider),
        flow: createFlow(flow)
    })

}

main()