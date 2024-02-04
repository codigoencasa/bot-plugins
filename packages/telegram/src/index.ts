import { ProviderClass } from '@bot-whatsapp/bot'
import { Telegraf } from 'telegraf'
import { generateRefprovider } from './util/hash'
import { Events, GlobalVendorArgs, MessageCreated } from './@types/types'

class TelegramProvider extends ProviderClass {
  public vendor: Telegraf

  constructor(public globalVendorArgs: GlobalVendorArgs) {
    super()
    this.vendor = new Telegraf(
      this.globalVendorArgs.token,
      this.globalVendorArgs?.options || undefined
    )
    const listEvents = this.busEvents()

    for (const { event, func } of listEvents) {
      // @ts-ignore
      this.vendor.on(event, func)
    }

    this.handleError()
    console.info('[INFO]: Provider loaded')
    this.vendor.launch(this.globalVendorArgs.launchOptions)
  }

  private handleError() {
    this.vendor.catch((error: any, _) => {
      console.error(`[ERROR]: ${error?.message}`)
    })
  }

  /**
   * Mapeamos los eventos nativos de  whatsapp-web.js a los que la clase Provider espera
   * para tener un standar de eventos
   * @returns
   */
  busEvents = () =>
    [
      {
        event: 'message',
        func: (messageCtx) => {
          let payload: any = {
            messageCtx: {
              ...messageCtx,
            },
            from: messageCtx?.chat?.id,
          }

          if (messageCtx.message) {
            // @ts-ignore
            payload.body = messageCtx.update?.message?.text
          }

          // validamos que sea un voice
          // @ts-ignore
          if (messageCtx?.message.voice) {
            payload.body = generateRefprovider('_event_voice_note_')
          }

          // Evaluamos si trae algún tipo de contendio que no sea text
          if (
            ['photo', 'document', 'video', 'sticker']
              // @ts-ignore
              .some((prop) => prop in Object(messageCtx?.update?.message))
          ) {
            payload.body = generateRefprovider('_event_media_')
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
    if (options.buttons.length) return this.sendButtons(chatId, text as string, options.buttons)
    if (options.media) return this.sendMedia(chatId, options.media, text as string)
    return this.vendor.telegram.sendMessage(chatId, text)
  }
}

export { TelegramProvider } 
