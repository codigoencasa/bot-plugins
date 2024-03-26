import { EventEmitter } from 'node:events';
import { urlencoded, json } from 'body-parser'
import { IncomingMessage, ServerResponse } from 'node:http';
import polka, { Next, type Polka } from 'polka'
import { WaliProvider } from "./provider";
import { BotCtxMiddleware } from "@builderbot/bot/dist/types";
import { WaliMessage } from './types';
import { utils } from '@builderbot/bot';


const idCtxBot = 'ctx-bot'

class WaliHttpServer extends EventEmitter {
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
            console.log(`[Wali]: GET http://localhost:${this.port}/`)
            console.log(`[Wali]: POST http://localhost:${this.port}/webhook`)
        })
    }

    eventInMsg = (payload: WaliMessage) => {

        if (payload.data?.from.includes('g.us') || !payload.data) return

        const sendObj = {
            ...payload,
            body: payload.data?.body || '',
            from: payload.data.fromNumber,
            name: payload.data.meta.notifyName,
            host: {
                phone: payload.data.toNumber
            },
        }
        if (['image', 'video'].includes(payload.data.type)) sendObj.body = utils.generateRefProvider('_event_media_')
        if (payload.data.type === 'document') sendObj.body = utils.generateRefProvider('_event_document_')
        if (payload.data.type === 'audio') sendObj.body = utils.generateRefProvider('_event_voice_note_')
        if (payload.data.type === 'location') sendObj.body = utils.generateRefProvider('_event_location_')

        this.emit('message', sendObj)
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
    <T extends Pick<WaliProvider, 'sendMessage'> & { provider: WaliProvider }>(
        ctxPolka: (bot: T | undefined, req: IncomingMessage, res: ServerResponse) => void
    ) =>
        (req: IncomingMessage, res: ServerResponse) => {
            const bot: T | undefined = req[idCtxBot] ?? undefined
            ctxPolka(bot, req, res)
        }

export { WaliHttpServer, handleCtx }