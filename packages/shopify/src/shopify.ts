import { init } from "bot-ws-plugin-openai"
import { AddonConfig } from "./types";
import { addKeyword, EVENTS } from "@bot-whatsapp/bot";
import { ZodObject, z } from "zod";
import { StructuredOutputParser } from "langchain/output_parsers";
import { RunnableSequence } from "@langchain/core/runnables";
import { PromptTemplate } from "@langchain/core/prompts";


import { getEnvironmentVariable } from "@langchain/core/utils/env";
import { ShopifyRunnable } from "./runnable";
import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";

class Shopify {
    schema = z.object({
        name: z.string().describe("name of the product for what user question or '' if not found"),
        details: z.string().describe("details of the product for what user question or '' if not found"),
    })

    model: ChatOpenAI
    embeddings: OpenAIEmbeddings

    constructor(
        public addonConfig?: AddonConfig
    ) {
        this.addonConfig ||= {
            model: "gpt-3.5-turbo-16k",
            temperature: 0,
            shopifyApiKey: getEnvironmentVariable('SHOPIFY_APY_KEY'),
            openAIApiKey: getEnvironmentVariable('OPENAI_API_KEY'),
            employess: []
        }

        this.model = new ChatOpenAI({
            openAIApiKey: this.addonConfig.openAIApiKey,
        })

        this.embeddings = new OpenAIEmbeddings({
            openAIApiKey: this.addonConfig.openAIApiKey
        })
        
    }

    private async retrieverExtraction<T>(
        question: any,
        // @ts-ignore
        schema: ZodObject<T>,
        model: ChatOpenAI
        ): Promise<z.infer<typeof schema>> {
    
        if (!Boolean(schema instanceof ZodObject)) {
            throw new Error('Schema must be an instance of ZodObject')
        }
    
        const parser = StructuredOutputParser.fromZodSchema(schema);
    
        const chain = RunnableSequence.from([
            PromptTemplate.fromTemplate(
                "Answer just based only on the data gived for the user as best as possible.\n{format_instructions}\n{question}"
            ),
            model,
            parser,
        ]);
    
        let response = await chain.invoke({
            question,
            format_instructions: parser.getFormatInstructions(),
        })
    
        return schema.parse(response)
    
    }

    createExtension() {
        if (!this.addonConfig.employess.length) throw new Error('Debe asignar almenos un empleado')

        return {
            employeesAddon: init(this.addonConfig).employees(this.addonConfig.employess)
        }
    }

    createFlow() {
        return addKeyword(EVENTS.WELCOME).addAction(async (ctx, ctxFn) => {
            const {state} = ctxFn

            const pluginAi = ctxFn.extensions.employeesAddon
              
            const mensajeEntrante = ctx.body //buenas me interesa el curso de nodejs
              
            const empleadoIdeal = await pluginAi.determine(mensajeEntrante)
            const schema = await this.retrieverExtraction(ctx.body, this.schema, this.model)
                        
            if (schema.name) {             
                const runnable = new ShopifyRunnable(this.embeddings, this.model)
                const answer = await runnable.invoke(ctx.body)
                state.update({answer})
            }else {
                if(!empleadoIdeal?.employee){
                  return ctxFn.flowDynamic('Ups lo siento no te entiendo ¿Como puedo ayudarte?')
                }
                state.update({answer:empleadoIdeal.answer})
            }


            pluginAi.gotoFlow(empleadoIdeal.employee, ctxFn)
            
            
          })
    }

}

export { Shopify };