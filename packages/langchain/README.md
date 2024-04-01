# USAGE


__CAPTURE THE INTENTION'S USER__


```ts
import "dotenv/config"
import { EVENTS, MemoryDB, createBot, createFlow, createProvider } from "@builderbot/bot"
import { TelegramProvider } from "@builderbot-plugins/telegram"
import { createFlowRouting, structuredOutput } from "src"
import z from "zod"

const welcome = createFlowRouting
    .setKeyword(EVENTS.WELCOME)
    .setIntentions({ 
        intentions: ['greeting','closure'], 
        description: `GREETING: si el usuario saluda\nCLOSURE: si el usuario se despide o agradece por cualquier cosa`
    })
    .setAIModel({ modelName: 'gemini' })
    .create({
        afterEnd(flow) {
            return flow.addAction((_, { state }) => {
                console.log(state.get('intention'))
                state.clear()
            })
        },
    })

const main = async () => {
    const provider = createProvider(TelegramProvider)

    createBot({
        database: new MemoryDB(),
        provider,
        flow: createFlow([welcome])
    })
}

main()
```

__CREATE STRUCTURED RESPONSE__


```ts
import "dotenv/config"
import { EVENTS, MemoryDB, createBot, createFlow, createProvider } from "@builderbot/bot"
import { TelegramProvider } from "@builderbot-plugins/telegram"
import { createFlowRouting, structuredOutput } from "src"
import z from "zod"


const welcome = structuredOutput
    .setKeyword(EVENTS.WELCOME)
    .setAIModel({ modelName: 'gemini' })
    .setZodSchema(z.object({ 
        name: z.string()
        .nullable()
        .describe('El nombre de la persona que interactua') }))
    .create({
        afterEnd(flow) {
            return flow.addAction((_, { state }) => {
                console.log(state.get('schema'))
                state.clear()
            })
        },
    })

const main = async () => {
    const provider = createProvider(TelegramProvider)

    createBot({
        database: new MemoryDB(),
        provider,
        flow: createFlow([welcome])
    })
}

main()

```
__CREATE AI RESPONSE__


```ts
import "dotenv/config"
import { EVENTS, MemoryDB, createBot, createFlow, createProvider } from "@builderbot/bot"
import { TelegramProvider } from "@builderbot-plugins/telegram"
import { createFlowRouting, structuredOutput } from "src"
import z from "zod"


const welcome = createAIFlow
    .setKeyword(EVENTS.WELCOME)
    .setAIModel({ modelName: 'gemini' })
    .setZodSchema(
        z.object({
            name: z.string().nullable().describe('El nombre de la persona por la cual pregunta el usuario'),
            age: z.number().nullable().describe('La edad de la persona por la cual pregunta el usuario')
        })
    )
    .create({
        afterEnd(flow) {
            return flow.addAction((_, { state }) => {
                console.log(state.get('aiAnswer'))
                state.clear()
            })
        }
    })
const main = async () => {
    const provider = createProvider(TelegramProvider)

    createBot({
        database: new MemoryDB(),
        provider,
        flow: createFlow([welcome])
    })
}

main()

```