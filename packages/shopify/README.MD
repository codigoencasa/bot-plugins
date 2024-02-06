# Shopify Adapter for bot-whatsapp

The shopify adapter using [Langchain](https://js.langchain.com) for [bot-whatsapp](https://bot-whatsapp.netlify.app/docs/) bot.
You can apply this provider into your createProvider function.

## Usage

```ts
import 'dotenv/config'
import { createBot, createFlow, MemoryDB, EVENTS, createProvider } from '@bot-whatsapp/bot'
import { Shopify, bootstrap } from '@builderbot-plugins/shopify'
import { TelegramProvider } from '@builderbot-plugins/telegram'

/** default **/
const flow = createShopifyFlow()

/** con opciones **/
const moreFlow = [
  {
    name: 'EMPLEADO_PAGAR',
    description:
      'Saludos, mi nombre es Juan encargado de generar los links de pagos necesarios cuando un usuario quiera hacer la recarga de puntos a la plataforma de cursos.',
    flow: pagarFlow,
  },
]
const flow = createShopifyFlow(moreFlow)

/** con opciones api bla bla **/
const moreFlow = [
  {
    name: 'EMPLEADO_PAGAR',
    description:
      'Saludos, mi nombre es Juan encargado de generar los links de pagos necesarios cuando un usuario quiera hacer la recarga de puntos a la plataforma de cursos.',
    flow: pagarFlow,
  },
]

const settgins = {
  model: 'gpt-3.5-turbo-16k',
  temperature: 0,
  apiKey: process.env.OPENAI_API_KEY,
}
const flow = createShopifyFlow(moreFlow, settgins)

const main = async () => {
  const provider = createProvider(TelegramProvider, {})

  await createBot({
    database: new MemoryDB(),
    provider,
    flow: flow,
  })
}

main()
```

## Author

Elimeleth Capuano <https://github.com/elimeleth>
