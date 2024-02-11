import { EVENTS, addKeyword } from "@bot-whatsapp/bot";
import { ClassManager } from "../../ioc";
import { EmployeesClass } from "@builderbot-plugins/openai-agents";
import { History, getHistory, handleHistory } from "../utils/handleHistory";

/**
 * @returns 
 */
const welcomeFlow = () => {

  const employees = ClassManager.hub().get<EmployeesClass>('employees')

  return addKeyword(EVENTS.WELCOME)
    .addAction(async (ctx, { state, flowDynamic, gotoFlow }) => {
      await handleHistory({ content: ctx.body, role: 'user' }, state)

      const a = getHistory(state)

      //todo esto movelro
      const formatChatHistory = (chatHistory: History[]) => {
        const formattedDialogueTurns = chatHistory.map(
          (dialogueTurn) => dialogueTurn.role === 'seller' ? `Seller: ${dialogueTurn.content}` : `Customer: ${dialogueTurn.content}`
        );
        return formattedDialogueTurns.join("\n");
      };
      const bestEmployee = await employees.determine(`History Conversation: ${formatChatHistory(a)}, New question: ${ctx.body}`)

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