# Shopify Adapter for bot-whatsapp

The shopify adapter using [Langchain](https://js.langchain.com) for [bot-whatsapp](https://bot-whatsapp.netlify.app/docs/) bot.
You can apply this provider into your createProvider function.

## Usage

```ts
import 'dotenv/config'
import { createBot, createFlow, MemoryDB, EVENTS, createProvider } from '@bot-whatsapp/bot'
import { Shopify } from '@builderbot-plugins/shopify'
import { TelegramProvider } from "@builderbot-plugins/telegram"


import flowWelcome from "./flows/hola"


const shopify = new Shopify({
    model: "gpt-3.5-turbo-16k",
    temperature: 0,
    shopifyApiKey: "YOUR_API_KEY_SHOPIFY",
    openAIApiKey: "YOUR_API_KEY_OPENAI",
    employess: [
        {
            name: "EMPLEADO_VENDEDOR",
            description: "Soy Rob el vendedor amable encargado de atentender si tienes intencion de comprar o interesado en algun producto, mis respuestas son breves.",
            flow: flowWelcome,
        }
    ]
})

const extension = shopify.createExtension()
const flow = shopify.createFlow()

const configExtra = {
    extensions:{
      ...extension
    }
  }

const main = async () => {
    const provider = createProvider(TelegramProvider, {

    })

    await createBot({
        database: new MemoryDB(),
        provider,
        flow: createFlow([flow, flowWelcome])
    }, configExtra as any)
}

main()
```

## Author

Elimeleth Capuano <https://github.com/elimeleth>
