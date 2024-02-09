import { HNSWLib } from "@langchain/community/vectorstores/hnswlib";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { StringOutputParser } from "@langchain/core/output_parsers";
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
import { cleanHtml } from "./bot/runnable/utils";
import { ANSWER_PROMPT, CONDENSE_QUESTION_PROMPT } from "./bot/runnable/prompt";

class ShopifyRunnable {

  public runnable: RunnableSequence<ConversationalRetrievalQAChainInput, any>
  private data: VectorStoreRetriever<HNSWLib | MemoryVectorStore>
  private chat_history: [string, string][] = []

  constructor(
    private embeddingModel: Embeddings,
    private model: BaseChatModel,
    private shopifyApyKey: string,
    private shopifyDomain: string,
  ) {

    this.buildRetriever().then(() => this.buildRunnable())
  }


  /**
   * encargar de construir el historial del chat
   * //TODO revisar
   * @param chatHistory 
   * @returns 
   */
  private formatChatHistory = (chatHistory: [string, string][]) => {
    const formattedDialogueTurns = chatHistory.map(
      (dialogueTurn) => `Human: ${dialogueTurn[0]}\nAssistant: ${dialogueTurn[1]}`
    );
    return formattedDialogueTurns.join("\n");
  };

  /**
   * 
   * @param products 
   * @returns 
   */
  private buildDocuments(products: Products[]) {
    const documents = []
    for (const product of products) {
      documents.push({
        pageContent: `
            name: ${cleanHtml(product.title)}
            description: ${cleanHtml(product.body_html)}
            prices: ${product.variants.map(v => v.price).join(', ')} //TODO aqui seria bueno conseguir el currency USD, EUR... 
            details: { option: ${product.options.name} values: ${product?.options?.values.length ? product?.options?.values.join(', ') : null} } 
            image: ${product.images.length ? product.images[0].src : null}
            status: ${product?.status}
            type: ${product.product_type ?? null}
            vendor: ${cleanHtml(product.vendor)}
            `,
        metadata: product.id
      })
    }

    return documents
  }


  /**
   * esto se encarga de crear db vector ejecutar cunado se incia
   * @returns 
   */
  private async buildRetriever() {
    const { products } = await getData<{ products: Products[] }>(
      this.shopifyApyKey,
      this.shopifyDomain,
      'products.json'
    )

    //TODO el tema de la ingesta de datos creo que para probar manejoemos en memory luego vemos

    const documents = this.buildDocuments(products)

    // const retriever = (await HNSWLib.fromDocuments(
    //   documents,
    //   this.embeddingModel
    // )).asRetriever(10)

    const retriever = (await MemoryVectorStore.fromDocuments(
      documents,
      this.embeddingModel
    )).asRetriever(10)

    console.log(retriever)
    this.data = retriever
  }

  async search(query: string) {
    return this.data.getRelevantDocuments(query)
  }

  /**
   * Obtener la info de la tienda
   * @returns 
   */
  async getInfoStore() {
    const data = await getData<any>(
      this.shopifyApyKey,
      this.shopifyDomain,
      'shop.json'
    )
    return data.shop
  }


  /**
   * 
   * @returns 
   */
  buildRunnable() {

    const standaloneQuestionChain = RunnableSequence.from([
      {
        question: (input: ConversationalRetrievalQAChainInput) => input.question,
        chat_history: (input: ConversationalRetrievalQAChainInput) =>
          this.formatChatHistory(input.chat_history),
      },
      CONDENSE_QUESTION_PROMPT,
      this.model,
      new StringOutputParser(),
    ]);

    const answerChain = RunnableSequence.from([
      {
        context: this.data.pipe(formatDocumentsAsString),
        question: new RunnablePassthrough(),
      },
      ANSWER_PROMPT,
      this.model
    ]);

    this.runnable = standaloneQuestionChain.pipe(answerChain);
  }

  /**
   * 
   * @param question 
   * @param chat_history 
   * @returns 
   */
  async invoke(question: string, chat_history: [string, string][] = []): Promise<string> {

    try {
      const { content } = await this.runnable.invoke({
        question,
        chat_history
      })

      const contentParse = JSON.parse(
        JSON.stringify(content.replace(/('|\n)/, "")
          .replace(/undefined/, null).trim()
        ))

      console.log({ contentParse })
      this.chat_history.push([question, contentParse])

      return content
    } catch (error) {
      throw new Error('An error ocurred into return EXPERT_EXPLOYEE_FLOW')
    }
  }
}

export { ShopifyRunnable };