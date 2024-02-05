# Telegram provider for bot-whatsapp

The provider using a polka server [Polka](https://github.com/lukeed/polka) for [bot-whatsapp](https://bot-whatsapp.netlify.app/docs/) bot.
You can apply this provider into your createProvider function.

## Usage

```ts
import 'dotenv/config'
import { addKeyword, createBot, createFlow, createProvider, EVENTS, MemoryDB } from '@bot-whatsapp/bot'
import { TelegramProvider, handleCtx } from '@builderbot-plugins/telegram'

const flowWelcome = addKeyword<TelegramProvider, MemoryDB>(EVENTS.WELCOME)
    .addAnswer("Hola desde telegram provider!")

const main = async () => {
    let provider = createProvider(TelegramProvider, {
        token: process.env.TELEGRAM_TOKEN
    })
        .initHttpServer(3002)

    provider.http?.server.post('/webhook', handleCtx(async (bot, req, res) => {
        return res.end('Hola desde telegram webhook provider!')
    }))


    await createBot({
        database: new MemoryDB(),
        provider,
        flow: createFlow([flowWelcome])
    })
}

main()
```

## Author

Elimeleth Capuano <https://github.com/elimeleth>
