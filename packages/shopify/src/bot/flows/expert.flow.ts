import { EVENTS, addKeyword } from "@bot-whatsapp/bot";
import { Shopify } from "../../shopify";

const expertFlow = (runnable?: Shopify) => {
    
    return addKeyword('producto')
        .addAction(async (ctx, { state, flowDynamic }) => {
            /** aqui deberia saludar, y tener luego hacer conexion con llm para hablar sobre los productos */
            /** la intencion se extrae del runnable el cual puede almacenar un historico o podriamos pasarlo desde el state */
            const answer = await runnable.invoke(ctx.body)
            const currentState = state.getMyState()
            return flowDynamic(`Hola soy el experto... ${answer}`)
        })
}

export { expertFlow }