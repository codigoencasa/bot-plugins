# This is a class thats extends from Openai BaseChatModel plugin for extension create bot and adaptable to langchain framework

## Usage

```ts
import { createShopifyFlow } from '@builderbot-plugins/shopify'
import { TelegramProvider } from '@builderbot-plugins/telegram'
import { FreeGPT } from "@builderbot-plugins/free-gpt"

const main = async () => {
    const provider = createProvider(TelegramProvider)

    /*
    {
        openApiKey: 'sk-',
        shopifyApiKey: 'shpat_',
        shopifyDomain: 'electonic',
        modelName: 'gpt-3.5-turbo'
    }
    */
    const flow = await createShopifyFlow({
        modelOrChatModel: new FreeGPT('gpt-3.5-turbo-0125'),
        openApiKey: process.env.OPENAI_API_KEY,
        shopifyApiKey: process.env.SHOPIFY_API_KEY,
        shopifyDomain: process.env.SHOPIFY_DOMAIN
    })


    const storeInfo = 'Electronicos 20030 ubicada en San Cristobal'

    const demo = addKeyword('hola').addAnswer('Buenas')

    await createBot({
        database: new MemoryDB(),
        provider,
        flow: createFlow(flow)
    })
}
main()
```

## Author

Elimeleth Capuano <https://github.com/elimeleth>
