# Shopify Adapter for bot-whatsapp

The shopify adapter using [Langchain](https://js.langchain.com) for [bot-whatsapp](https://bot-whatsapp.netlify.app/docs/) bot.
You can apply this provider into your createProvider function.

## Usage

```ts
import 'dotenv/config'
import { createBot, MemoryDB, createProvider } from '@bot-whatsapp/bot'
import { Shopify, bootstrap } from '@builderbot-plugins/shopify'
import { TelegramProvider } from '@builderbot-plugins/telegram'

/*
there three ways for using this plugin below you find the examples for its using

*/

/*
#1 default

you need set this enviroments into your .env file

OPENAI_API_KEY=
SHOPIFY_API_KEY=
SHOPIFY_DOMAIN=
*/
const shopify_flow = createShopifyFlow()

/** -------------------------------------------------------------- */

/*
#2 setting configurations

*/
const configurations = {
  modelName: 'gpt-3.5-turbo-16k',
  temperature: 0,
  openApiKey: 'YOUR_OPENAI_APIKEY',
  shopifyApiKey: 'YOUR_SHOPIFY_APIKEY',
  shopifyDomain: 'YOUR_SHOPIFY_DOMAIN',

}

const shopify_flow = createShopifyFlow(configurations)


/** -------------------------------------------------------------- */


/*
#3 setting configurations and extra flows

*/
const configurations = {
    modelName: 'gpt-3.5-turbo-16k',
    temperature: 0,
    openApiKey: 'YOUR_OPENAI_APIKEY',
    shopifyApiKey: 'YOUR_SHOPIFY_APIKEY',
    shopifyDomain: 'YOUR_SHOPIFY_DOMAIN',
    flows: [
      {
          name: YOUR_AGENT_NAME,
          description: YOUR_DESCRIPTION_AGENT,
          flow: YOUR_FLOW,
      },
      {
          name: YOUR_AGENT_NAME,
          description: YOUR_DESCRIPTION_AGENT,
          flow: YOUR_FLOW,
      }
      {
          name: YOUR_AGENT_NAME,
          description: YOUR_DESCRIPTION_AGENT,
          flow: YOUR_FLOW,
      }
    ]
}

const shopify_flow = createShopifyFlow(configurations)

/** -------------------------------------------------------------- */

const main = async () => {
  const provider = createProvider(TelegramProvider, {})

  await createBot({
    database: new MemoryDB(),
    provider,
    flow: shopify_flow,
  })
}

main()
```

## Author

Elimeleth Capuano <https://github.com/elimeleth>
