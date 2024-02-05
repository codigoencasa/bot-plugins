import { urlencoded, json } from 'body-parser'
import { createReadStream } from 'fs'
import { EventEmitter } from 'node:events'
import { join } from 'path'
import polka, { Next, type Polka } from 'polka'
import { BotCtxMiddleware } from './types'
import { TelegramProvider } from './provider'
import { Telegraf } from 'telegraf'

import { IncomingMessage, ServerResponse } from 'node:http';

const idCtxBot = 'ctx-bot'

class TelegramHttpServer extends EventEmitter {
    public server: Polka
    

    constructor(public port: number) {
        super()
        this.server = this.buildHTTPServer()
    }

    /**
     *
     * @param _
     * @param res
     */
    protected indexHome = (_: IncomingMessage, res: ServerResponse) => {
        const qrPath = join(process.cwd(), `bot.qr.png`)
        const fileStream = createReadStream(qrPath)
        res.writeHead(200, { 'Content-Type': 'image/png' })
        fileStream.pipe(res)
    }

    /**
     * Contruir HTTP Server
     */
    protected buildHTTPServer(): Polka {
        return polka()
            .use(urlencoded({ extended: true }))
            .use(json())
            .get('/qr', this.indexHome)
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