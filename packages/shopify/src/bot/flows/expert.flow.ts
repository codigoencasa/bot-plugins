import { EVENTS, addKeyword } from '@bot-whatsapp/bot'
import { Shopify } from '../../shopify'

const expertFlow = (_: any, runnable: Shopify) => {
  return addKeyword(EVENTS.ACTION)
    .addAction(async (ctx, { flowDynamic }) => {
      const messageHuman = ctx.body
      const answer = await runnable.invoke(messageHuman)
      return flowDynamic(answer)
    })
}

export { expertFlow }
