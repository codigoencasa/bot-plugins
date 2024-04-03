import { RunnablePassthrough, RunnableSequence } from "@langchain/core/runnables"
import { qaPrompt } from "../prompts"
import { InvokeParams } from "../../types"
import { ZodType, ZodTypeDef, z } from "zod"
import { JsonOutputParser } from "@langchain/core/output_parsers"
import { StructuredOutputParser } from "langchain/output_parsers"
import { contextualizeQChain } from "./contextualizer.rag"
import { BaseRetriever } from "@langchain/core/retrievers"
import { BaseChatModel } from "@langchain/core/language_models/chat_models"

export default class Runnable {

    constructor(
        private model: BaseChatModel,
        private context: BaseRetriever
    ) {
    }

    async retriever<T>(invokeParams: InvokeParams, 
        schema?: ZodType<T, ZodTypeDef, T>) {
        invokeParams.format_instructions = new StructuredOutputParser(schema).getFormatInstructions()

        let prompt: any = qaPrompt

        if (this.model?.withStructuredOutput) {
            prompt = prompt
                .pipe(this.model.withStructuredOutput(schema))
        } else {
            prompt = prompt.pipe(this.model
                .pipe(
                    new JsonOutputParser()
                ))
        }

        return RunnableSequence.from([
            RunnablePassthrough.assign({
                language: () => 'spanish',
                context: async (input: Record<string, unknown>) => {
                    const chain = contextualizeQChain(this.model)
                    let context = await chain.pipe(this.context).invoke({
                        history: input.history,
                        question: input.question
                    }) as any

                    context = context.length && context.map(doc => doc.pageContent).join('\n') || ''
                    return context
                }
            }),
            prompt
        ]).invoke(invokeParams) as z.infer<typeof schema>
    }
}