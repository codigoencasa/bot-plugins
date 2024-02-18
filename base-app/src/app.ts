import 'dotenv/config'
import { createBot, MemoryDB, createProvider, addKeyword, createFlow, EVENTS } from '@bot-whatsapp/bot'
import { createShopifyFlow } from '@builderbot-plugins/shopify'
import { TelegramProvider } from '@builderbot-plugins/telegram'
import { FreeGPT } from "@builderbot-plugins/free-gpt"

const main = async () => {

    const provider = createProvider(TelegramProvider)

    const { flow } = await createShopifyFlow()

    await createBot({
        database: new MemoryDB(),
        provider,
        flow: createFlow(flow)
    })

}

main()