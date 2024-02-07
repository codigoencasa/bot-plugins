import { EVENTS, addKeyword } from '@bot-whatsapp/bot'
import { Shopify } from '../../shopify'

const expertFlow = (_: any, runnable: Shopify) => {
  return addKeyword(EVENTS.ACTION)
    .addAction(async (ctx, { state, flowDynamic }) => {
      let answer = await runnable.invoke(ctx.body)
      
      let response
      try {
        if (typeof answer === 'string') answer = JSON.parse(answer)
        
        if (answer.image) {
          response = [{
            body: answer.answer,
            media: answer.image
          }]
        }else {
          response = answer.answer
        }
      } catch (_) {}

      const history = state.get<{ role: 'user' | 'assisten', content: string }[]>('history') ?? []
      history.push({
          role: 'assisten',
          content: answer.answer
      })

      console.log('response', response)
      return flowDynamic(response)
    })
}

export { expertFlow }
