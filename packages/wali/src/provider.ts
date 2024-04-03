import { Middleware } from 'polka';
import { writeFile } from 'fs/promises'
import { createReadStream } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { BotContext, GlobalVendorArgs, SendOptions } from "@builderbot/bot/dist/types";

import axios, { AxiosResponse } from 'axios'
import FormData from 'form-data'
import mime from 'mime-types'

import { ProviderClass, utils } from "@builderbot/bot";
import { WaliEvents } from './wali.events';
import { Vendor } from './types';

const URL = 'https://api.wali.chat'

export class WaliProvider extends ProviderClass<WaliEvents> {
    globalVendorArgs: any // Implementa la propiedad abstracta
    vendor: Vendor<WaliEvents>; // Implementa la propiedad
    idBotName: string; // Implementa la propiedad
    idCtxBot: string; // Implementa la propiedad

    constructor(args: GlobalVendorArgs) {
        super(); // Llama al constructor de la clase padre
        this.globalVendorArgs = { ...this.globalVendorArgs, ...args }
        if (!this.globalVendorArgs.token) {
            throw new Error('Must provide Wali Token https://app.wali.chat/developers/apikeys')
        }
        if (!this.globalVendorArgs.deviceId) {
            throw new Error('You must provide the DeviceID https://app.wali.chat/')
        }
    }

    protected beforeHttpServerInit(): void {
        // Implementa la lógica necesaria
    }

    protected afterHttpServerInit(): void {
        // Implementa la lógica necesaria
    }

    protected busEvents(): Array<{ event: string; func: Function }> {
        // Implementa la lógica necesaria y devuelve el array de eventos
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

    protected async initVendor(): Promise<any> {
        // Implementa la inicialización del vendor y devuelve una promesa
        const vendor = new WaliEvents()
        this.vendor = vendor
        this.server = this.server
        .post('/webhook', this.ctrlInMsg)
        await this.checkStatus(this.globalVendorArgs.deviceId);
        return vendor
    }

    async sendMessage<K = any>(userId: string, message: any, options?: SendOptions): Promise<K> {
        // Implementa el envío de mensaje y devuelve una promesa
        // @ts-ignore
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
            // @ts-ignore
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
    // @ts-ignore
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
            return ''
        }
    }

    /**
     * Check the status of the Wali device.
     * @param deviceId - ID of the device to check.
     */
    private checkStatus = async (deviceId: string) => {
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
                        `Check: https://app.wali.chat/${deviceId}/info`
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

}