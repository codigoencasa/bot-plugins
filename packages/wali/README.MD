# Wali provider for Builderbot

The provider using a polka server [Polka](https://github.com/lukeed/polka) for [bot-whatsapp](https://bot-whatsapp.netlify.app/docs/) bot.
You can apply this provider into your createProvider function.

## Usage

```ts
import "dotenv/config"

import { createBot, createProvider, MemoryDB } from '@builderbot/bot'
import { WaliProvider } from "@builderbot-plugins/wali"

const main = async () => {

    const welcome = addKeywork(EVENTS.WELCOME).addAnswer('hello!')

    const provider = createProvider(WaliProvider, {
        name: "shurupitos",
        port: proccess.env?.PORT || 9000,
        token: 'YOUR_TOKEN_HERE',
        deviceId: 'YOUR_DEVICE_ID_HERE'
    })

    const { handleCtx, httpServer } = await createBot({
        flow: [welcome],
        provider,
        database: new MemoryDB(),
    })

    httpServer(+PORT)

    provider.server.post(
        '/v1/messages',
        handleCtx(async (bot, req, res) => {
            const { number, message, urlMedia } = req.body
            await provider.sendMessage(number, message, { media: urlMedia ?? null })
            res.statusCode = 201
            return res.end('ok')
        })
    )
}

main()

```

## Author

Elimeleth Capuano <https://github.com/elimeleth>
