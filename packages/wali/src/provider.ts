import { Middleware } from 'polka';
import { writeFile } from 'fs/promises'
import { createReadStream } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { ProviderClass, utils } from "@builderbot/bot";
import { BotContext,SendOptions, GlobalVendorArgs } from "@builderbot/bot/dist/types";
import { WaliEvents } from "./hook";
import axios, { AxiosResponse } from 'axios'
import FormData from 'form-data'
import mime from 'mime-types'

const URL = 'https://api.wali.chat'

export type WaliArgs = GlobalVendorArgs & { token: string, deviceId: string }


/**
 * Provider class for interacting with the Wali API.
 */
export class WaliProvider extends ProviderClass {
    globalVendorArgs: WaliArgs = {
        name: 'bot',
        port: 3000,
        token: undefined,
        deviceId: undefined
    };
    
    vendor: WaliEvents
    server: any

    /**
     * Constructor for WaliProvider.
     * @param args - Arguments for WaliProvider.
     */
    constructor(args?: WaliArgs) {
        super();
        this.globalVendorArgs = { ...this.globalVendorArgs, ...args }
        if (!this.globalVendorArgs.token) {
            throw new Error('Must provide Wali Token https://app.wali.chat/developers/apikeys')
        }
        if (!this.globalVendorArgs.deviceId) {
            throw new Error('You must provide the DeviceID https://app.wali.chat/')
        }

        this.server = this.initHttpServer(args?.port || 9000, null)
    }

    /**
     * Initialize the Wali vendor and set up the server.
     * @returns Promise<any>
     */
    protected async initVendor(): Promise<any> {
        this.vendor = new WaliEvents()
        this.server = this.server
            .post('/webhook', this.ctrlInMsg)

        await this.checkStatus(this.globalVendorArgs.deviceId);
        return this.vendor
    }

    /**
     * Some logic before init http server
     * @returns void
     */
    protected beforeHttpServerInit(): void {
    }

    /**
     * Some logic after init http server
     * @returns void
     */
    protected afterHttpServerInit(): void {
    }

    /**
     * @returns void
     */
    protected busEvents = (): { event: string; func: Function; }[] => {
        return [
            {
                event: 'auth_failure',
                func: (payload: any) => this.emit('auth_failure', payload),
            },
            {
                event: 'ready',
                func: () => this.emit('ready', true),
            },
            {
                event: 'message',
                func: (payload: BotContext) => {
                    this.emit('message', payload)
                },
            },
            {
                event: 'host',
                func: (payload: any) => {
                    this.emit('host', payload)
                },
            }
        ]
    }

    private fileTypeFromFile = async (response: AxiosResponse): Promise<{ type: string | null; ext: string | false }> => {
        const type = response.headers['content-type'] ?? ''
        const ext = mime.extension(type)
        return {
            type,
            ext,
        }
    }

    /**
     * Middleware function for handling incoming messages.
     */
    protected ctrlInMsg: Middleware = (req, res) => {
        this.vendor.eventInMsg(req.body)
        return res.end('ok')
    }

    /**
     * Function to donwload the files incoming
     * @param idResource 
     * @returns 
     */
    private downloadFile = async (idResource: string): Promise<{ buffer: Buffer; extension: string }> => {
        try {
            const urlMedia = `${URL}${idResource}`
            const response: AxiosResponse = await axios.get(urlMedia, {
                headers: {
                    Token: this.globalVendorArgs.token,
                },
                responseType: 'arraybuffer',
            })
            const { ext } = await this.fileTypeFromFile(response)
            if (!ext) throw new Error('Unable to determine file extension')
            return {
                buffer: response.data,
                extension: ext,
            }
        } catch (error) {
            console.error(error.message)
        }
    }

    /**
     * Upload a file to the Wali API.
     * @param urlOrPathfile - URL or path of the file to upload.
     * @returns Promise<string> - ID of the uploaded file.
     */
    private uploadToVendor = async (urlOrPathfile: string): Promise<string> => {
        const fileDownloaded = await utils.generalDownload(urlOrPathfile)
        const formData = new FormData()
        const mimeType = mime.lookup(fileDownloaded)
        formData.append('file', createReadStream(fileDownloaded), {
            contentType: mimeType,
        })

        try {
            const response = await axios.post(
                `${URL}/v1/files`,
                formData,
                {
                    headers: {
                        Token: this.globalVendorArgs.token,
                    },
                }
            )
            return response.data[0].id
        } catch (err) {
            if (err.response.data.status === 409) {
                return err.response.data.meta.file
            }
            console.log(`Error:`, err.response.data)
            return
        }
    }

    /**
     * Check the status of the Wali device.
     * @param deviceId - ID of the device to check.
     */
    checkStatus = async (deviceId: string) => {
        try {
            const dataApi = await fetch(`${URL}/v1/devices/${deviceId}/health`, {
                headers: {
                    Token: this.globalVendorArgs.token
                }
            })
            const data = await dataApi.json()

            if (data.status === 'online') {
                this.emit('ready')
                return
            }

            if (data.status !== 200) {
                this.emit('auth_failure', {
                    instructions: [
                        data.message ?? `You must reconnect your device`,
                        ``,
                        `Check: ${URL}/${deviceId}/info`
                    ]
                })
                return
            }

            this.emit('ready')
            return
        } catch (err) {
            console.log(err)
            this.emit('auth_failure', { instructions: [] })
            return
        }
    }

    /**
     * Send a message to a user.
     * @param userId - ID of the user to send the message to.
     * @param message - Message content.
     * @param options - Additional options for sending the message.
     * @returns Promise<any>
     */
    async sendMessage(userId: string, message: any, options?: SendOptions): Promise<any> {
        options = { ...options, ...options['options'] }
        const payload: any = {
            "phone": `+${utils.removePlus(userId)}`,
            "message": message
        }

        if (options?.media) {
            const idResource = await this.uploadToVendor(options.media)
            payload.media = { file: idResource }
        }

        const body = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Token: this.globalVendorArgs.token
            },
            body: JSON.stringify(payload)
        };
        const dataApi = await fetch(`${URL}/v1/messages`, body)
        const data = await dataApi.json()
        return data
    }

    /**
     * Save a file from a message context.
     * @param ctx - Bot context containing the file information.
     * @param options - Additional options for saving the file.
     * @returns Promise<string> - Path of the saved file.
     */
    async saveFile(ctx: BotContext & { data?: { media: { links?: { download: string } } } }, options?: { path: string; }): Promise<string> {
        if (!ctx?.data?.media) return ''
        try {
            const { buffer, extension } = await this.downloadFile(ctx.data.media.links.download)
            const fileName = `file-${Date.now()}.${extension}`
            const pathFile = join(options?.path ?? tmpdir(), fileName)
            await writeFile(pathFile, buffer)
            return pathFile
        } catch (err) {
            console.log(`[Error]:`, err.message)
            return 'ERROR'
        }
    }
}
