import { EVENTS, addKeyword } from "@bot-whatsapp/bot";
import { ClassManager } from "../../ioc";
import { EmployeesClass } from "@builderbot-plugins/openai-agents";
import sellerFlow from "./seller.flow";

/**
 * @returns 
 */
const welcomeFlow = () => {

  const employees = ClassManager.hub().get<EmployeesClass>('employees')

  return addKeyword(EVENTS.WELCOME)
    .addAction(async (ctx, { state, flowDynamic, gotoFlow }) => {

      const incomingMessage = ctx.body
      const bestEmployee = await employees.determine(incomingMessage)

      if (!bestEmployee?.employee) {
        return flowDynamic('Ups lo siento no te entiendo ¿Como puedo ayudarte?') //esto luego puede ser un mensaje que se pueda custom por args
      }

      await state.update({
        lastMessageAgent: `${bestEmployee?.answer}`
      })

      return gotoFlow(bestEmployee.employee.flow)
    })
}

export { welcomeFlow }