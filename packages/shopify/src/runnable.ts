import { HNSWLib } from "@langchain/community/vectorstores/hnswlib";
import { JsonOutputParser, StringOutputParser } from "@langchain/core/output_parsers";
import { PromptTemplate } from "@langchain/core/prompts";
import {
  RunnableSequence,
  RunnablePassthrough,
} from "@langchain/core/runnables";

import { formatDocumentsAsString } from "langchain/util/document";

import { getData } from "./mock/index"
import { ConversationalRetrievalQAChainInput, Products } from "./types";
import { Embeddings } from "@langchain/core/embeddings";
import { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { VectorStoreRetriever } from "@langchain/core/vectorstores";

class ShopifyRunnable {
  private CONDENSE_QUESTION_PROMPT = PromptTemplate.fromTemplate(
    `Given the following conversation and a follow up question, rephrase the follow up question to be a standalone question, in its original language.
    
        Chat History:
        {chat_history}
        Follow Up Input: {question}
        Standalone question:`
  );


  private ANSWER_PROMPT = PromptTemplate.fromTemplate(`Answer the question based only on the following context:
{context}

just always answer into spanish language

REMEMBER THAT:
YOU'RE AN EMPLOYEE FOR SHOPIFY SHOP, TURNING YOUR RESPONSES INTO PROFESSIONALS ANSWERS AND PROVIDE THE ANSWER IN SPANISH
TURNING YOUR RESPONSES WITH A LOT DETAILS TO UNDERSTAND THE ANSWER
ALWAYS PROVIDE DETAILS AND DON'T SAY JUST ANSWER THE ANSWER 
YOU MUST TO ANSWER RELATED TO QUESTION'S USER

YOUR ESSENTIAL TASK IS RETURN A JSON OBJECT THAT CONTAINS THAT ANSWER AND OTHER THINGS BELOW THERE AN EXAMPLE
json'
  "answer": your answer provided,
  "description": description's product or null,
  "prices": prices's product or null,
  "details": details's product or null,
  "image": image's product or null,
  "status": status's product or null,
  "type": type's product or null,
  "vendor": vendor's product or null
'

---
Question: {question}
`);

  runnable: RunnableSequence<ConversationalRetrievalQAChainInput, any> | undefined
  private data: VectorStoreRetriever<HNSWLib>
  constructor(
    private embeddingModel: Embeddings,
    private model: BaseChatModel,
    private shopifyApyKey: string,
    private shopifyDomain: string,
  ) {
    this.buildRetriever().then(retriever => this.data = retriever)
  }

  private chat_history: [string, string][] = []


  private formatChatHistory = (chatHistory: [string, string][]) => {
    const formattedDialogueTurns = chatHistory.map(
      (dialogueTurn) => `Human: ${dialogueTurn[0]}\nAssistant: ${dialogueTurn[1]}`
    );
    return formattedDialogueTurns.join("\n");
  };

  private build_documents(products: Products[]) {
    const documents = []
    for (const product of products) {

      documents.push({
        pageContent: `
            name: ${product.title?.replace(/<[a-z]*>/, "").replace(/\n/, "").trim()}
            description: ${product.body_html?.replace(/<[a-z]*>/, "").replace(/\n/, "").trim() ?? null}
            prices: ${product.variants.map(v => v.price).join(', ')}
            details: { option: ${product.options.name} values: ${product?.options?.values.length ? product?.options?.values.join(', ') : null} } 
            image: ${product.images.length ? product.images[0].src : null}
            status: ${product?.status}
            type: ${product.product_type ?? null}
            vendor: ${product.vendor.replace(/<[a-z]*>/, "").replace(/\n/, "").trim()}
            `,
        metadata: {
          ...product
        }
      })
    }

    return documents
  }


  private async buildRetriever() {
    const { products } = await getData(
      this.shopifyApyKey,
      this.shopifyDomain
    ) as { products: Products[] }
    //TODO el tema de la ingesta de datos creo que para probar manejoemos en memory luego vemos
    return (await HNSWLib.fromDocuments(
      this.build_documents(products),
      this.embeddingModel
    )).asRetriever(3)
  }

  async search(query: string) {
    return this.data.getRelevantDocuments(query)
  }

  async  getInfoStore() {
    const data = await getData(
      this.shopifyApyKey,
      this.shopifyDomain,
      'shop.json'
    )

    return data.shop
  }


  async buildRunnable() {

    const standaloneQuestionChain = RunnableSequence.from([
      {
        question: (input: ConversationalRetrievalQAChainInput) => input.question,
        chat_history: (input: ConversationalRetrievalQAChainInput) =>
          this.formatChatHistory(input.chat_history),
      },
      this.CONDENSE_QUESTION_PROMPT,
      this.model,
      new StringOutputParser(),
    ]);

    const answerChain = RunnableSequence.from([
      {
        context: this.data.pipe(formatDocumentsAsString),
        question: new RunnablePassthrough(),
      },
      this.ANSWER_PROMPT,
      this.model
    ]);

    return standaloneQuestionChain.pipe(answerChain);
  }

  async invoke(question: string, chat_history: [string, string][] = [], language?: string) {
    if (!this.runnable) {
      console.info('[RUNNABLE]: Building RAG')
      this.runnable = await this.buildRunnable()
  }

    let { content } = await this.runnable.invoke({
      question,
      chat_history: chat_history && chat_history.length ? chat_history : this.chat_history || [],
    })
    
    try {
        content = JSON.parse(
          JSON.stringify(content.replace(/('|\n)/, "")
        .replace(/undefined/, null).trim()
        ))
        
    } catch (error) {
      throw new Error('An error ocurred into return EXPERT_EXPLOYEE_FLOW')
    }

    console.log({ content })
    
    this.chat_history.push([question, content])

    return content
    
  }


}

export { ShopifyRunnable };