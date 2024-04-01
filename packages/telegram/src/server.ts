import { urlencoded, json } from 'body-parser'
import { IncomingMessage, ServerResponse } from 'node:http';
import polka, { Next, type Polka } from 'polka'
import { Telegraf } from 'telegraf'

import { TelegramProvider } from './provider'
import { EventEmitterClass } from "@builderbot/bot"
import { BotCtxMiddleware, ProviderEventTypes } from '@builderbot/bot/dist/types';


const idCtxBot = 'ctx-bot'

class TelegramHttpServer extends EventEmitterClass<ProviderEventTypes> {
    public server: Polka


    constructor(public port: number) {
        super()
        this.server = this.buildHTTPServer()
    }

    /**
     * Contruir HTTP Server
     */
    protected buildHTTPServer(): Polka {
        return polka()
            .use(urlencoded({ extended: true }))
            .use(json())
            .get('/', (_, res) => {
                res.statusCode = 200
                res.end('Hello world!')
            })
    }

    /**
     * Iniciar el servidor HTTP
     */
    start(vendor: BotCtxMiddleware, port?: number) {
        this.port = port || this.port
        this.server.use(async (req: IncomingMessage, _: ServerResponse, next: Next) => {
            req[idCtxBot] = vendor
            if (req[idCtxBot]) return next()
            return next()
        })

        this.server.listen(this.port, () => {
            console.log(`[telegram]: GET http://localhost:${this.port}/`)
            console.log(`[telegram]: POST http://localhost:${this.port}/webhook`)
        })
    }

    stop(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.server.server.close((err) => {
                if (err) {
                    reject(err)
                } else {
                    resolve()
                }
            })
        })
    }
}

/**
 *
 * @param ctxPolka
 * @returns
 */
const handleCtx =
    <T extends Pick<TelegramProvider, 'sendMessage'> & { provider: Telegraf }>(
        ctxPolka: (bot: T | undefined, req: IncomingMessage, res: ServerResponse) => void
    ) =>
        (req: IncomingMessage, res: ServerResponse) => {
            const bot: T | undefined = req[idCtxBot] ?? undefined
            ctxPolka(bot, req, res)
        }

export { TelegramHttpServer, handleCtx }