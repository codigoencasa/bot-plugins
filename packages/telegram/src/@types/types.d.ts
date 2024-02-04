import { Context, NarrowedContext, Telegraf } from 'telegraf'
import { Guard } from 'telegraf/typings/core/helpers/util'
import { Update } from 'telegraf/typings/core/types/typegram'
import { UpdateType } from 'telegraf/typings/telegram-types'

type GlobalVendorArgs = {
  token: string
  options?: Partial<Telegraf.Options<Context<Update>>> | undefined
  launchOptions?: Telegraf.LaunchOptions
}

declare namespace GlobalUpdate {
  type MessageUpdate =
    | Update.MessageUpdate
    | Update.ChannelPostUpdate
    | Update.EditedMessageUpdate
    | Update.EditedChannelPostUpdate
    | Update.InlineQueryUpdate
    | Update.ChosenInlineResultUpdate
    | Update.CallbackQueryUpdate
    | Update.PollUpdate
}

type MessageCreated = NarrowedContext<Context<Update>, GlobalUpdate.MessageUpdate>

type Events = UpdateType | (Guard<any> & {})

export { GlobalVendorArgs, MessageCreated, Events }

declare module '@bot-whatsapp/bot' {
  // Definiciones de tipos para el contexto del bot
  type BotContext = {
    SmsMessageSid: string
    NumMedia: string
    ProfileName: string
    pushName?: string
    body: string
    from: string
  }

  // Definiciones de tipos para el estado del bot
  type BotState = {
    update: (props: any) => Promise<void>
    getMyState: <K>() => { [key: string]: any | K }
    get: (prop: string) => any
    getAllState: () => { [key: string]: any }
    clear: () => void
  }

  // Propiedades de acción del bot
  type ActionPropertiesKeyword = {
    capture?: boolean
    delay?: number
    regex?: boolean
    sensitive?: boolean
  }

  type ActionPropertiesGeneric = Omit<ActionPropertiesKeyword, 'sensitive' | 'regex'>

  // Mensaje dinámico para el flujo del bot
  type FlowDynamicMessage = {
    body: string
    delay?: number
    media?: string
  }

  // Métodos disponibles para el bot
  type BotMethods = {
    flowDynamic: (messages: string | FlowDynamicMessage[]) => Promise<void>
    gotoFlow: (flow: any) => Promise<void>
    endFlow: (message?: string) => void
    fallBack: (message?: string) => void
    provider: any
    state: BotState
    extensions: any
  }

  // Función de devolución de llamada del bot
  type CallbackFunction = (context: BotContext, methods: BotMethods) => void

  // Cadena de métodos para la construcción de acciones
  type IMethodsChain = {
    addAction: (
      actionProps: ActionPropertiesGeneric | CallbackFunction,
      cb?: CallbackFunction
    ) => IMethodsChain
    addAnswer: (
      message?: string | string[],
      options?: ActionPropertiesKeyword,
      cb?: CallbackFunction
    ) => IMethodsChain
  }

  /**
   * Crea un nuevo flujo.
   * @param args - Opciones de configuración del flujo.
   * @returns Instancia del flujo.
   */
  function createFlow(args: any): any

  type ICreateFlowArg = {
    flow: any
    database: any
    provider: any
  }

  /**
   * Crea una nueva instancia de bot.
   * @param config - Opciones de configuración del bot.
   * @param args - Argumentos adicionales.
   * @returns Instancia del bot.
   */
  function createBot({ flow, database, provider }: ICreateFlowArg, args?: any): Promise<any>

  /**
   * Crea una nueva instancia del proveedor.
   * @param providerClass - Clase del proveedor.
   * @param args - Argumentos adicionales.
   * @returns Instancia del proveedor.
   */
  function createProvider<C>(
    providerClass?: new (args: any) => C,
    args?: T extends Pick<C, 'globalVendorArgs' | 'vendorArgs' | 'args'>
      ? C['globalVendorArgs'] & C['vendorArgs'] & C['args']
      : C
  ): C

  /**
   * Agrega una palabra clave al bot.
   * @param args - Opciones de configuración de la palabra clave.
   * @param opts - Opciones adicionales.
   * @returns Objeto con métodos addAction y addAnswer.
   */
  function addKeyword(args: string | string[], opts?: ActionPropertiesKeyword): IMethodsChain

  // Constantes de eventos del bot
  const EVENTS: {
    MEDIA: string
    LOCATION: string
    DOCUMENT: string
    VOICE_NOTE: string
    ACTION: string
    WELCOME: string
  }

  ProviderClass: any

  // Exportaciones del módulo
  export {
    BotContext,
    BotMethods,
    ProviderClass,
    createBot,
    createFlow,
    createProvider,
    addKeyword,
    EVENTS,
    IMethodsChain,
    ActionPropertiesGeneric,
  }
}
