import { EmployeesClass } from '@builderbot-plugins/openai-agents/dist/plugin.employees'
import { EVENTS, addKeyword } from '@bot-whatsapp/bot'
import { Shopify } from '../../shopify'

const expertFlow = (_: EmployeesClass, runnable: Shopify) => {
  return addKeyword(EVENTS.ACTION)
    .addAction(async (ctx, { flowDynamic }) => {
      const messageHuman = ctx.body
      const answer = await runnable.invoke(messageHuman)
      return flowDynamic(answer)
    })
}

export { expertFlow }
