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