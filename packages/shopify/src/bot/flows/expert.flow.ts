import { EVENTS, addKeyword } from "@bot-whatsapp/bot";
import { ActionPropertiesKeyword } from "@bot-whatsapp/bot/dist/types";

const expertFlow = (keyword: string | [string, ...string[]], options?: ActionPropertiesKeyword) => {
    const ACTION_OR_KEYWORD = keyword.length ? keyword : EVENTS.ACTION
    return addKeyword(ACTION_OR_KEYWORD, options)
        .addAction(async (_, { state, flowDynamic }) => {
            /** aqui deberia saludar, y tener luego hacer conexion con llm para hablar sobre los productos */
            const currentState = state.getMyState()
            return flowDynamic(`Hola soy el experto...`)
        })
}

export { expertFlow }