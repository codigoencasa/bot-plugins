import { EVENTS, addKeyword } from "@bot-whatsapp/bot";
import { ActionPropertiesKeyword } from "@bot-whatsapp/bot/dist/types";
import { Shopify } from "../../shopify";

const expertFlow = (
    keyword: string | [string, ...string[]], 
    options?: ActionPropertiesKeyword, runnable?: Shopify) => {
    const ACTION_OR_KEYWORD = keyword.length ? keyword : EVENTS.ACTION
    return addKeyword(ACTION_OR_KEYWORD, options)
        .addAction(async (ctx, { state, flowDynamic }) => {
            /** aqui deberia saludar, y tener luego hacer conexion con llm para hablar sobre los productos */
            /** la intencion se extrae del runnable el cual puede almacenar un historico o podriamos pasarlo desde el state */
            const answer = await runnable.invoke(ctx.body)
            const currentState = state.getMyState()
            return flowDynamic(`Hola soy el experto... ${answer}`)
        })
}

export { expertFlow }