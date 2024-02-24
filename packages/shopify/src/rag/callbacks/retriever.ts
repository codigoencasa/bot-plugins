import { DocumentInterface } from "@langchain/core/documents"
import { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { PromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { StructuredOutputParser } from "langchain/output_parsers";
import z from "zod"

import { ClassManager } from "../../ioc";

export async function getProductNameFromQuestion(question: string) {
    
    const model = ClassManager.hub().get<BaseChatModel>('modelInstance')
    const parser = StructuredOutputParser.fromZodSchema(
        z.object({
          product_name: z.string().describe("name of the product that user is looking for")
        })) as any
        
        const chain = RunnableSequence.from([
          PromptTemplate.fromTemplate(
            "Answer the users question as best as possible.\n{format_instructions}\n{question}"
          ),
          model,
          parser,
        ]);

        try {
            const output = await chain.invoke({
            format_instructions: parser.getFormatInstructions(),
            question
          })
          
          return output?.product_name || question
        } catch (error) {
          return question
        } 

}

export default class CustomCallbacks {
    name: string = 'CUSTOM_HANDLER'

    async handleRetrieverEnd(product_name: string, documents: DocumentInterface<Record<string, any>>[]) {
      documents = documents.filter(doc => doc.metadata._distance && doc.metadata._distance <= .4)
      
      if (documents.length === 0) {
        return []
      }

      /** ESTO, SI NO TENEMOS EL PRODUCT NAME Y RESULTA SER LA MISMA QUESTION */
      if (product_name.split(' ').length > 1) {
        return documents
      }
      
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