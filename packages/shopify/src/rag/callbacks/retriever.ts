import { BaseCallbackHandler } from "@langchain/core/callbacks/base"
import { DocumentInterface } from "@langchain/core/documents"
import { ClassManager } from "../../ioc";
import { BaseChatModel } from "@langchain/core/language_models/chat_models";


import { PromptTemplate } from "@langchain/core/prompts";

import { StructuredOutputParser } from "langchain/output_parsers";
import z from "zod"
import { RunnableSequence } from "@langchain/core/runnables";

export async function getProductNameFromQuestion(question: string) {
    
    const model = ClassManager.hub().get<BaseChatModel>('modelInstance')
    const parser = StructuredOutputParser.fromZodSchema(
        z.object({
          product_name: z.string().describe("name of the product that user is looking for")
        }))
        
        const chain = RunnableSequence.from([
          PromptTemplate.fromTemplate(
            "Translate the users question into english language and answer the users question as best as possible.\n{format_instructions}\n{question}"
          ),
          model,
          parser,
        ]);

        try {
            let output = await chain.invoke({
            format_instructions: parser.getFormatInstructions(),
            question
          })
          
          return output.product_name
        } catch (error) {
          return question
        } 

}

export default class CustomCallbacks {
    name: string = 'CUSTOM_HANDLER'

    async handleRetrieverEnd(product_name: string, documents: DocumentInterface<Record<string, any>>[]) {
        const product_names = documents.map(d => 
            d.pageContent.replace('name: ', '')
                .split('\n').filter(Boolean)[0].trim())
        
          const re = new RegExp(`${product_name}`, 'gim')
         
          if (!product_names.some(name => name.match(re).length)) {
            return []
          }

          return documents
    }
}