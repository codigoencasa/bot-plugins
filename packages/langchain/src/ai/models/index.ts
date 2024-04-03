import { ChatOpenAI } from "@langchain/openai";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { InvokeParams, ModelArgs, ModelName } from "../../types";
import { PROMPT_STRUCT } from "../struct";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { SYSTEM_STRUCT_TEMPLATE } from "../prompts";
import { JsonOutputParser } from "@langchain/core/output_parsers";
import z, {ZodType, ZodTypeDef } from "zod"

export default class FactoryModel {
    model: BaseChatModel
    constructor(private ai?: {modelName: ModelName, args?: ModelArgs}) {
        this.initModel(ai.modelName, ai.args)
    }

    get instance() {
        return this.ai?.modelName || 'openai'
    }

    protected createTemplateMessage (invokeParams: InvokeParams) {
        
        const question = new HumanMessage({
            content: [
                {
                    type: "text",
                    text: invokeParams.question
                },
            ]
        })
    
        const system = SYSTEM_STRUCT_TEMPLATE
            .replace('{question}', invokeParams.question)
            .replace('{history}', JSON.stringify(invokeParams.history))
            .replace('{format_instructions}', invokeParams.format_instructions)
    
    
    
        const template = new SystemMessage({
            content: system,
            name: 'system',
        })

        return [template].concat(question)
    
    }
    
    async createStructure<T>(invokeParams: InvokeParams, llmStructuredOutputTool: ZodType<T, ZodTypeDef, T>) {
        if (this.model?.withStructuredOutput) {
            return await PROMPT_STRUCT
                .pipe(this.model.withStructuredOutput(llmStructuredOutputTool))
                .invoke(invokeParams) as z.infer<typeof llmStructuredOutputTool>;
        }

        return await this.model
            .pipe(
                new JsonOutputParser()
            )
            .invoke(this.createTemplateMessage(invokeParams)) as z.infer<typeof llmStructuredOutputTool>;

    }


    private initModel(model?: ModelName, args? : ModelArgs) {
        if (model === 'gemini') {
            this.model = new ChatGoogleGenerativeAI({
                modelName: args?.modelName || 'gemini-pro',
                maxOutputTokens: args?.maxOutputTokens || 2048,
                apiKey: args?.apikey || process.env.GOOGLE_API_KEY
            })
        }else {
            this.model = new ChatOpenAI({
                modelName: args?.modelName || 'gpt-3.5-turbo-16k',
                maxTokens: args?.maxOutputTokens || 2048,
                openAIApiKey: args?.apikey || process.env.OPENAI_API_KEY
            })
        }
    }
}