import { EVENTS, addKeyword } from '@bot-whatsapp/bot'
import { Shopify } from '../../shopify'

const expertFlow = (_: any, runnable: Shopify) => {
  return addKeyword(EVENTS.ACTION)
    .addAction(async (ctx, { state, flowDynamic }) => {
      const answer = await runnable.invoke(ctx.body)
      
      const history = state.get<{ role: 'user' | 'assisten', content: string }[]>('history') ?? []
      history.push({
          role: 'assisten',
          content: answer
      })

      return flowDynamic(answer)
    })
}

export { expertFlow }
