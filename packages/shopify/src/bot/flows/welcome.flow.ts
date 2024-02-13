import { EVENTS, addKeyword } from "@bot-whatsapp/bot";
import { ClassManager } from "../../ioc";
import { getHistory, handleHistory } from "../utils/handleHistory";
import { Runnable } from "../../rag/runnable";
import { generateTimer } from "../../utils/generateTimer";
import { EmployeesClass } from "@builderbot-plugins/openai-agents";

/**
 * @returns 
 */
const welcomeFlow = () => {

  const employees = ClassManager.hub().get<EmployeesClass>('employees')

  return addKeyword(EVENTS.WELCOME)
    .addAction(async (ctx, { state, flowDynamic, gotoFlow }) => {
      const runnable = ClassManager.hub().get<Runnable>('runnable')

      const bestEmployee = await employees.determine(ctx.body)

      console.log(`[bestEmployee]:`, bestEmployee)

      if (bestEmployee?.employee) {
        return gotoFlow(bestEmployee.employee.flow)
      }
      const re = /(http|https)?:\/\/\S+?\.(?:jpg|jpeg|png|gif)(\?.*)?$/

      const history = getHistory(state)
      let textLarge = await runnable.toAsk(ctx.name, ctx.body, history)
      const image = textLarge.match(re)
      
      const chunks = textLarge.replace(re, '').split(/(?<!\d)\.\s+/g);

      await handleHistory({ content: ctx.body, role: 'user' }, state)
      await handleHistory({ content: textLarge, role: 'seller' }, state)

      if (image?.length) {
        const content = chunks.shift()
        await flowDynamic([{ 
          body: content.trim(),
          media: image.at(0),
          delay: generateTimer(50, 150) 
        }]);
      }

      for (const chunk of chunks) {
        await flowDynamic([{ body: chunk.trim(), delay: generateTimer(150, 250) }]);
      }
    })
}

export { welcomeFlow }