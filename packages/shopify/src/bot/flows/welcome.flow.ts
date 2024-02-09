import { EVENTS, addKeyword } from "@bot-whatsapp/bot";
import conversation from "../layers/conversation";
import { ClassManager } from "../../ioc";
import { EmployeesClass } from "@builderbot-plugins/openai-agents";
import sellerFlow from "./seller.flow";

/**
 * @returns 
 */
const welcomeFlow = () => {

  const employees = ClassManager.hub().get<EmployeesClass>('employees')

  return addKeyword(EVENTS.WELCOME)
    .addAction(conversation)
    .addAction(async (ctx, { state, flowDynamic, gotoFlow }) => {

      const incomingMessage = ctx.body //buenas me interesa el curso de nodejs
      const bestEmployee = await employees.determine(incomingMessage)

      if (!bestEmployee?.employee) {
        if (state.get('lastFlow')) return gotoFlow(state.get('lastFlow'))
        return flowDynamic('Ups lo siento no te entiendo ¿Como puedo ayudarte?') //esto luego puede ser un mensaje que se pueda custom por args

      }
      await state.update({ lastMessageAgent: `${bestEmployee?.answer}` })
      await state.update({ lastFlow: bestEmployee.employee.flow })

      console.log(`[NEXT ------->]`, bestEmployee.employee.name)
      if (bestEmployee.employee.name.includes('EMPLEADO_VENDEDOR')) {
        return gotoFlow(sellerFlow)
      }

      return gotoFlow(bestEmployee.employee.flow)
    })
}

export { welcomeFlow }