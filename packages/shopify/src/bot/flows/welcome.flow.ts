// import {EmployeesClass} from "@builderbot-plugins/openai-agents/dist/plugin.employees";
import { EVENTS, addKeyword } from "@bot-whatsapp/bot";
import conversation from "../layers/conversation";
import welcome from "../layers/welcome";

/**
 * Este flow se encarga de usar ai para determina cual es el mejor empleado para responder
 * @param employees 
 * @returns 
 */
const welcomeFlow = (employees: any) => {
  return addKeyword(EVENTS.WELCOME)
    /** aqui pueden ir validaciones de bienvenida si el usuario esta o no en nuestro registro */ 
    // .addAction(welcome)
    // .addAction({ capture: true}, async (ctx, { state, flowDynamic }) => {
    //     await state.update({ name: ctx.body })
    //     await flowDynamic(`Gracias, ${ctx.body}, prosigamos...`)
    // })
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
      
      return gotoFlow(bestEmployee.employee.flow)
    })
}

export { welcomeFlow }