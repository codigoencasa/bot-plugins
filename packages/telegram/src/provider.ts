import "dotenv/config"
import { ProviderClass, utils } from '@builderbot/bot'
import { Telegraf, Telegram } from 'telegraf'

import { TelegramHttpServer } from './server'
import { GlobalVendorArgs, Vendor } from './types'

class TelegramProvider extends ProviderClass<Telegraf> {
  globalVendorArgs: any // Implementa la propiedad abstracta
  vendor: Vendor<Telegraf>; // Implementa la propiedad
  idBotName: string; // Implementa la propiedad
  idCtxBot: string; // Implementa la propiedad
  private telegram: Telegram

  constructor(
    globalVendorArgs: Partial<GlobalVendorArgs>
  ) {
    super();
    this.globalVendorArgs = { ...this.globalVendorArgs, ...globalVendorArgs }
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
    // Implementa la lógica necesaria
}

  protected afterHttpServerInit(): void {
      // Implementa la lógica necesaria
  }
  protected async initVendor(): Promise<any> {
    this.vendor = new Telegraf(this.globalVendorArgs?.token || process.env.TELEGRAM_TOKEN)
    this.initProvider()
    this.server = new TelegramHttpServer(this.globalVendorArgs?.port || 9000).server
    this.telegram = this.vendor.telegram
    return this.vendor
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
        func: (messageCtx: any) => {
          const payload: any = {
            messageCtx: {
              ...messageCtx,
            },
            from: messageCtx?.chat?.id,
          }

          if (messageCtx.message) {
            payload.body = messageCtx.update?.message?.text
          }

          if (messageCtx?.message.voice) {
            payload.body = utils.generateRefProvider('_event_voice_note_')
          }

          // Evaluamos si trae algún tipo de contendio que no sea text
          if (
            ['photo', 'video']
              .some((prop) => prop in Object(messageCtx?.update?.message))
          ) {
            payload.body = utils.generateRefProvider('_event_media_')
          }

          if (messageCtx?.update?.message?.location) {
            payload.body = utils.generateRefProvider('_event_location_')
          }

          if (messageCtx?.update?.message?.document) {
            payload.body = utils.generateRefProvider('_event_document_')
          }

          // @ts-ignore
          this.emit('message', payload)
        },
      },
    ]
  }

  private sendImage(chatId: string | number, media: any, caption: string) {
    if (typeof media === 'string' && !media.match(/^(http|https)/)) {
      media = {
        source: media,
      }
    }
    this.telegram.sendPhoto(chatId, media, { caption })
  }

  private sendButtons(chatId: number | string, text: string, buttons: { body: string, cb: any }[]) {
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

        if (btn) {
          const cb_response = await btn.cb(action)
          if (cb_response) {
            await action.editMessageText(cb_response)
            await action.editMessageReplyMarkup({ inline_keyboard: [] })
          }
        }
      } catch (error) {
        console.error(error?.message)
      }
    })
  }

  private sendFile(chatId: string | number, media: any, caption: string) {
    if (typeof media === 'string' && !media.match(/^(http|https)/)) {
      media = {
        source: media,
      }
    }
    this.telegram.sendDocument(chatId, media, { caption })
  }

  private sendVideo(chatId: string | number, media: any, caption: string) {
    if (typeof media === 'string' && !media.match(/^(http|https)/)) {
      media = {
        source: media,
      }
    }
    this.telegram.sendAudio(chatId, media, { caption })
  }

  private sendAudio(chatId: number | string, media: any, caption: string) {
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
    const { path, fileType } = opts as {
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
