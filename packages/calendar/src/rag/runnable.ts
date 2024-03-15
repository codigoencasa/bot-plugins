import { RunnableSequence, RunnablePassthrough } from "@langchain/core/runnables"
import { CALENDARY } from "../prompts"
import { StringOutputParser } from "@langchain/core/output_parsers"

import { FreeGPT } from "@builderbot-plugins/free-gpt"

export default RunnableSequence.from([
        RunnablePassthrough.assign({
            date: async (_: Record<string, unknown>) => {
                return '2024/03'
        }
        }),
        CALENDARY,
        new FreeGPT('gpt-3.5-turbo-1106')
    ]).pipe(new StringOutputParser())