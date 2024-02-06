import { EVENTS, addKeyword } from "@bot-whatsapp/bot";
import { loadFile } from "../../faq.runnable";
import { ChatOpenAI } from "@langchain/openai";

const faqFlow = () => {
    
    return addKeyword('dudas')
        .addAction(async (ctx, { state, flowDynamic }) => {
            
            const chain = await loadFile('./src/data', new ChatOpenAI())
            const { text } = await chain.invoke({ query: ctx.body })

            console.log('answer', text)
            const currentState = state.getMyState()
            return flowDynamic(`Hola soy el experto... ${text}`)
        })
}

export { faqFlow }