import { EVENTS, addKeyword } from '@bot-whatsapp/bot'
import { Shopify } from '../../shopify'
import { ClassManager } from '../../ioc'

export default addKeyword(EVENTS.ACTION)
  .addAction(async (ctx, { state, flowDynamic }) => {
    const shopify = ClassManager.hub().get<Shopify>('shopify')
    await flowDynamic('entre en el experto')
    return
    // let answer = await runnable.invoke(ctx.body)

    // let response
    // try {
    //   if (typeof answer === 'string') answer = JSON.parse(answer)

    //   if (answer.image) {
    //     response = [{
    //       body: answer.answer,
    //       media: answer.image
    //     }]
    //   } else {
    //     response = answer.answer
    //   }
    // } catch (_) { }

    // const history = state.get<{ role: 'user' | 'assisten', content: string }[]>('history') ?? []
    // history.push({
    //   role: 'assisten',
    //   content: answer.answer
    // })

    // console.log('response', response)
    // return flowDynamic(response)
  })
