import { EVENTS, addKeyword } from '@bot-whatsapp/bot'
import { ClassManager } from '../../ioc'
import { ShopifyRunnable } from '../../runnable'

export default addKeyword(EVENTS.ACTION)
  .addAction(async (ctx, { state, flowDynamic }) => {
    const runnable = ClassManager.hub().get<ShopifyRunnable>('runnableInstance')
    await flowDynamic('entre en el experto')
    
    let answer = await runnable.invoke(ctx.body)
    
    let response
    try {
      if (typeof answer === 'string') answer = JSON.parse(answer)

      if (answer.image) {
        response = [{
          body: answer.answer,
          media: answer.image
        }]
      } else {
        response = answer.answer
      }
    } catch (_) { }

    const history = state.get<{ role: 'user' | 'assisten', content: string }[]>('history') ?? []
    history.push({
      role: 'assisten',
      content: answer.answer
    })

    return flowDynamic(response)
  })
