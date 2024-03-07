import "dotenv/config"
import { ProviderClass, utils } from '@bot-whatsapp/bot'
import { Vendor } from '@bot-whatsapp/bot/provider/provider.class'
import { Telegraf } from 'telegraf'

import { TelegramHttpServer } from './server'
import { BotCtxMiddleware, Events, GlobalVendorArgs, MessageCreated } from './types'

class TelegramProvider extends ProviderClass {
  vendor: Vendor<Telegraf>
  http: TelegramHttpServer | undefined

  constructor(
    public globalVendorArgs: Partial<GlobalVendorArgs>
  ) {
    super();
    this.vendor = new Telegraf(this.globalVendorArgs?.token || process.env.TELEGRAM_TOKEN)
    this.initProvider()
  }

  private initProvider() {

    const listEvents = this.busEvents()

    for (const { event, func } of listEvents) {
      //@ts-ignore
      this.vendor.on(event, func)
    }

    this.handleError()
    console.info('[INFO]: Provider loaded')
    this.vendor.launch()
  }

  private handleError() {
    this.vendor.catch((error: any) => {
      console.error(`[ERROR]: ${error?.message}`)
    })
  }

  /**
   * Mapeamos los eventos nativos de  whatsapp-web.js a los que la clase Provider espera
   * para tener un standar de eventos
   * @returns
   */
  private busEvents = () =>
    [
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
            payload.body = utils.generateRefprovider('_event_voice_note_')
          }

          // Evaluamos si trae algún tipo de contendio que no sea text
          if (
            ['photo', 'document', 'video', 'sticker']
              .some((prop) => prop in Object(messageCtx?.update?.message))
          ) {
            payload.body = utils.generateRefprovider('_event_media_')
          }

          // @ts-ignore
          this.emit('message', payload)
        },
      },
    ] as { event: Events; func: (messageCtx: MessageCreated) => void }[]

  private sendImage(chatId: string | number, media: any, caption: string) {
    if (typeof media === 'string' && !media.match(/^(http|https)/)) {
      media = {
        source: media,
      }
    }
    this.vendor.telegram.sendPhoto(chatId, media, { caption })
  }

  private sendButtons(chatId: number | string, text: string, buttons: { body: string }[]) {
    this.vendor.telegram.sendMessage(chatId, text, {
      reply_markup: {
        inline_keyboard: [
          buttons.map((btn) => ({
            text: btn.body,
            callback_data: btn.body,
          })),
        ],
      },
    })
  }

  private sendFile(chatId: string | number, media: any, caption: string) {
    if (typeof media === 'string' && !media.match(/^(http|https)/)) {
      media = {
        source: media,
      }
    }
    this.vendor.telegram.sendDocument(chatId, media, { caption })
  }

  private sendVideo(chatId: string | number, media: any, caption: string) {
    if (typeof media === 'string' && !media.match(/^(http|https)/)) {
      media = {
        source: media,
      }
    }
    this.vendor.telegram.sendAudio(chatId, media, { caption })
  }

  private sendAudio(chatId: number | string, media: any, caption: string) {
    if (typeof media === 'string' && !media.match(/^(http|https)/)) {
      media = {
        source: media,
      }
    }
    this.vendor.telegram.sendAudio(chatId, media, { caption })
  }

  initHttpServer(port?: number) {
    this.http = new TelegramHttpServer(port || this.globalVendorArgs?.port || 9000)

    const methods: BotCtxMiddleware = {
      sendMessage: this.sendMessage,
      provider: this.vendor,
    }
    this.http.start(methods, port)

    return this
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
    const { options } = extra
    if (options?.buttons?.length) return this.sendButtons(chatId, text as string, options.buttons)
    if (options?.media) return this.sendMedia(chatId, options.media, text as string)
    return this.vendor.telegram.sendMessage(chatId, text)
  }

  saveFile = async (args: { ctx: MessageCreated, path?: string, fileType: "photo"|"voice"|"document"}) => {
    const { ctx, path, fileType } = args;

    let file_id: string;
    
    switch(fileType) {
      case "photo":
        // @ts-ignore
        file_id = ctx.update.message.photo[-1].file_id
        break;
      case "voice":
        // @ts-ignore
        file_id = ctx.update.message.voice[-1].file_id
        break;
      case "document":
        // @ts-ignore
        file_id = ctx.update.message.document[-1].file_id
        break;
      default:
        // @ts-ignore
        file_id = ctx.update.message.photo[-1].file_id
        break;
    }
    
    return await this.vendor.telegram.getFileLink(file_id)
  }
}

export { TelegramProvider }  
