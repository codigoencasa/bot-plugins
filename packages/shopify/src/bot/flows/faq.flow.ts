import { addKeyword } from "@bot-whatsapp/bot";
import { ChatOpenAI } from "@langchain/openai";

import { loadFile } from "../../faq.runnable";

const faqFlow = () => {

    return addKeyword('dudas')
        .addAction(async (ctx, { flowDynamic }) => {

            const chain = await loadFile('./src/data', new ChatOpenAI())
            const { text } = await chain.invoke({ query: ctx.body })

            return flowDynamic(`Hola soy el experto... ${text}`)
        })
}

export { faqFlow }