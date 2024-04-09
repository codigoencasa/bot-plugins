import "dotenv/config"
import { ProviderClass, utils } from '@builderbot/bot'
import { Telegraf, Telegram } from 'telegraf'

import { TelegramHttpServer } from './server'
import { GlobalVendorArgs, MessageCreated, Vendor } from './types'
import polka from "polka"

class TelegramProvider extends ProviderClass<Telegraf> {
  public globalVendorArgs: GlobalVendorArgs<{
    token?: string;
    name: string;
    port: number
  }> = {
    name: `bot`,
    port: 9000
}

  vendor: Vendor<Telegraf>; // Implementa la propiedad
  idBotName: string; // Implementa la propiedad
  idCtxBot: string; // Implementa la propiedad
  private telegram: Telegram

  constructor(
    args: Partial<GlobalVendorArgs>
  ) {
    super();
    this.globalVendorArgs = { ...this.globalVendorArgs, ...args }
  }

  private initProvider() {
    this.handleError()
    console.info('[INFO]: Provider loaded')
    this.vendor.launch()
  }

  private handleError() {
    this.vendor.catch((error: any) => {
      console.error(`[ERROR]: ${error?.message}`)
    })
  }

  protected beforeHttpServerInit(): void {
    this.server = this.server
        .use((req, _, next) => {
            req['globalVendorArgs'] = this.globalVendorArgs
            return next()
        })
        .get('/', this.indexHome)
}

  protected afterHttpServerInit(): void {
      // Implementa la lógica necesaria
  }

  public indexHome: polka.Middleware = (req, res) => {
    const botName = req[this.idBotName]
    res.end('Hello bot!' + botName)
}

protected async initVendor () {
    this.vendor = new Telegraf(this.globalVendorArgs?.token || process.env.TELEGRAM_TOKEN)
    this.initProvider()
    this.server = new TelegramHttpServer(this.globalVendorArgs?.port || 9000).server
    this.telegram = this.vendor.telegram
    return this.vendor.telegram
  }

  /**
   * Mapeamos los eventos nativos de  whatsapp-web.js a los que la clase Provider espera
   * para tener un standar de eventos
   * @returns
   */
  protected busEvents(): Array<{ event: string; func: Function }> {
    return [
      {
        event: 'message',
        func: (messageCtx: MessageCreated) => {
          /*

            {
              message_id: 782,
              from: {
                id: 1869174190,
                is_bot: false,
                first_name: 'Elimeleth',
                username: 'jstellmelimeleth',
                language_code: 'es'
              },
              chat: {
                id: 1869174190,
                first_name: 'Elimeleth',
                username: 'jstellmelimeleth',
                type: 'private'
              },
              date: 1712626963,

           */
          // @ts-ignore
          const message = messageCtx?.update?.message
          const payload: any = {
            messageCtx: {
              ...message,
            },
            from: messageCtx?.chat?.id,
            // @ts-ignore
            name: message?.chat?.first_name 
            // @ts-ignore
              || message?.chat?.username
          }

          if (messageCtx.message) {
            // @ts-ignore
            payload.body = message?.text
          }

            // @ts-ignore
          if (messageCtx?.message.voice) {
            payload.body = utils.generateRefProvider('_event_voice_note_')
            // @ts-ignore
            payload.url = message.voice.at(-1)?.file_id
            payload.voice = message.voice

          }

          // Evaluamos si trae algún tipo de contendio que no sea text
          if (
            ['photo', 'video']
            // @ts-ignore
              .some((prop) => prop in Object(message))
          ) {
            payload.body = utils.generateRefProvider('_event_media_')
            try {
               // @ts-ignore
                payload.url = message?.photo ? message.photo.at(-1).file_id : message.video.at(-1).file_id
                payload.media = message?.photo || message?.video
            } catch (error) {
              payload.url = null
            }
          }

            // @ts-ignore
          if (message?.location) {
            payload.body = utils.generateRefProvider('_event_location_')
            // @ts-ignore
            payload.location = message.location
          }

            // @ts-ignore
          if (message?.document) {
            payload.body = utils.generateRefProvider('_event_document_')
            // @ts-ignore
            payload.document = message.document
            payload.url = message.document?.file_id
          }

          // @ts-ignore
          this.emit('message', payload)
        },
      },
    ]
  }

  sendImage = (chatId: string | number, media: any, caption: string) => {
    if (typeof media === 'string' && !media.match(/^(http|https)/)) {
      media = {
        source: media,
      }
    }
    this.telegram.sendPhoto(chatId, media, { caption })
  }

  sendButtons = (chatId: number | string, text: string, buttons: { body: string, cb: any }[]) => {
    this.telegram.sendMessage(chatId, text, {
      reply_markup: {
        inline_keyboard: [
          buttons.map((btn) => ({
            text: btn.body,
            callback_data: btn.body
          })),
        ]
      },
    })

    /* Action thats return a callback from a channel or group telegram */
    this.vendor.on('callback_query', async (action) => {
      // TODO: create a middleware for this
      try {
        // @ts-ignore
        const btn = buttons.find(btn => btn.body === action.update.callback_query?.data)
        let btns: any =  buttons.filter(bt => bt.body !== btn.body)
        btns = btns.length ? [[btns
          .map((btn) => ({
            text: btn.body,
            callback_data: btn.body
        }))]] : []
        if (btn) {
          const cb_response = await btn.cb(action)
          if (cb_response) {
            // await action.editMessageText(cb_response)
            await action.editMessageReplyMarkup({ inline_keyboard: btns })
          }
        }
      } catch (error) {
        console.error(error?.message)
      }
    })
  }

  sendFile = (chatId: string | number, media: any, caption: string) => {
    if (typeof media === 'string' && !media.match(/^(http|https)/)) {
      media = {
        source: media,
      }
    }
    this.telegram.sendDocument(chatId, media, { caption })
  }

  sendVideo = (chatId: string | number, media: any, caption: string) => {
    if (typeof media === 'string' && !media.match(/^(http|https)/)) {
      media = {
        source: media,
      }
    }
    this.telegram.sendAudio(chatId, media, { caption })
  }

  sendAudio = (chatId: number | string, media: any, caption: string) => {
    if (typeof media === 'string' && !media.match(/^(http|https)/)) {
      media = {
        source: media,
      }
    }
    this.telegram.sendAudio(chatId, media, { caption })
  }

  /**
   * @alpha
   * @param {string} chatId
   * @param {string} message
   * @example await sendMessage('+XXXXXXXXXXX', 'https://dominio.com/imagen.jpg' | 'img/imagen.jpg')
   */
  sendMedia = async (chatId: string, media: any, caption: string) => {
    if (media.match(/(image|\.(jpg|jpeg|png))/gim)) return this.sendImage(chatId, media, caption)
    if (media.match(/\.(docx?|pdf|txt|rtf)/gim)) return this.sendFile(chatId, media, caption)
    if (media.match(/\.(mp3|wav|ogg)$/gim)) return this.sendAudio(chatId, media, caption)
    if (media.match(/video|(\.(mp4))/gim)) return this.sendVideo(chatId, media, caption)

    this.sendMessage(chatId, caption)
  }

  /**
   *
   * @param {*} number
   * @param {*} message
   * @param {*} param2
   * @returns
   */
  sendMessage = async (chatId: string, text: string, extra?: any): Promise<any> => {
    console.info('[INFO]: Sending message to', chatId)
    const options = extra?.options || {} 
    if (options?.buttons?.length) return this.sendButtons(chatId, text as string, options.buttons)
    if (options?.media) return this.sendMedia(chatId, options.media, text as string)
    return this.telegram.sendMessage(chatId, text)
  }

  saveFile = async (ctx: any, opts: any) => {
    const { fileType } = opts as {
      path?: string, fileType: "photo" | "voice" | "document"
  }

    ctx = ctx?.messageCtx

    let file_id: string;

    // @ts-ignore
    const message = ctx.update?.message

    try {
      switch (fileType) {
        case "photo":
          // @ts-ignore
          file_id = message.photo.at(-1).file_id
          break;
        case "voice":
          // @ts-ignore
          file_id = message.voice.at(-1).file_id
          break;
        case "document":
          // @ts-ignore
          file_id = message.document.at(-1).file_id
          break;
        default:
          // @ts-ignore
          file_id = message.photo.at(-1).file_id
          break;
      }
    } catch (error) {
      throw new Error(`[ERROR]: ${error?.message}`)
    }

    const { href: url } = await this.telegram.getFileLink(file_id)

    return url
  }
}

export { TelegramProvider }