import { EmployeesClass } from "@builderbot-plugins/openai-agents/dist/plugin.employees";
import { EVENTS, addKeyword } from "@bot-whatsapp/bot";

/**
 * Este flow se encarga de usar ai para determina cual es el mejor empleado para responder
 * @param employees 
 * @returns 
 */
const welcomeFlow = (employees: EmployeesClass) => {
  return addKeyword(EVENTS.WELCOME)
    .addAction(async (ctx, { state, flowDynamic, gotoFlow }) => {
      const incomingMessage = ctx.body //buenas me interesa el curso de nodejs
      const bestEmployee = await employees.determine(incomingMessage)
      if (!bestEmployee?.employee) {
        return flowDynamic('Ups lo siento no te entiendo ¿Como puedo ayudarte?') //esto luego puede ser un mensaje que se pueda custom por args
      }
      await state.update({ lastMessageAgent: `${bestEmployee?.answer}` })
      return gotoFlow(bestEmployee.employee.flow)
    })
}

export { welcomeFlow }