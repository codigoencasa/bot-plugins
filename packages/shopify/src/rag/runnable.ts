import { HNSWLib } from "@langchain/community/vectorstores/hnswlib";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { StringOutputParser } from "@langchain/core/output_parsers";

import {
  RunnableSequence,
  RunnablePassthrough,
} from "@langchain/core/runnables";

import { formatDocumentsAsString } from "langchain/util/document";

import { ConversationalRetrievalQAChainInput } from "../types";
import { Embeddings } from "@langchain/core/embeddings";
import { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { VectorStoreRetriever } from "@langchain/core/vectorstores";
import { SELLER_ANSWER_PROMPT } from "./prompts/seller/prompt";
import { Channel } from "../channels/respository";
import { CONDENSE_QUESTION_PROMPT } from "./prompts";
import { CLOSER_ANSWER_PROMPT } from "./prompts/closer/prompt";
<<<<<<< HEAD
import { storeManager } from "./history";
import { LanceDB } from "@langchain/community/vectorstores/lancedb";
=======
import { History } from "../bot/utils/handleHistory";
>>>>>>> 107ff824d565e4f002e63b755b1ccc8112f6b2ab


/**
 * esta clase no debe saber nada de shopify ni wordpress, esto solo debe saber de unos metodos genericos
 * para obtener la info de las "tiendas"
 */
class Runnable {

  public runnableSeller: RunnableSequence<ConversationalRetrievalQAChainInput, any>
  public runnableCloser: RunnableSequence<ConversationalRetrievalQAChainInput, any>
  private data: VectorStoreRetriever<HNSWLib | MemoryVectorStore | LanceDB>

  constructor(
    private channel: Channel,
    private embeddingModel: Embeddings,
    private model: BaseChatModel
  ) {

  }

  /**
   * encargar de construir el historial del chat
   * //TODO revisar colocar empleado y cliente
   * @param chatHistory 
   * @returns 
   */
  private formatChatHistory = (chatHistory: History[]) => {
    const formattedDialogueTurns = chatHistory.map(
      (dialogueTurn) => dialogueTurn.role === 'seller' ? `Seller: ${dialogueTurn.content}` : `Customer: ${dialogueTurn.content}`
    );
    return formattedDialogueTurns.join("\n");
  };

  /**
   * 
   * @param k num files
   * @returns 
   */
  public async buildStore(k = 10): Promise<VectorStoreRetriever<HNSWLib | MemoryVectorStore | LanceDB>> {

    const store = await storeManager(this.channel)
    const asRetriever = store.asRetriever(k)
    this.data = asRetriever
    return asRetriever
  }

  /**
   * 
   * @param query 
   * @returns 
   */
  async search(query: string) {
    return this.data.getRelevantDocuments(query)
  }

  /**
   * proceso para el agente encargado de dar informacion sobre un producto
   * @returns 
   */
  buildRunnableSeller(store: VectorStoreRetriever<HNSWLib | MemoryVectorStore>) {

    const standaloneQuestionChain = RunnableSequence.from([
      {
        question: (input: ConversationalRetrievalQAChainInput) => input.question,
        customer_name: (input: ConversationalRetrievalQAChainInput) => input.customer_name,
        chat_history: (input: ConversationalRetrievalQAChainInput) =>
          this.formatChatHistory(input.chat_history),
      },
      CONDENSE_QUESTION_PROMPT,
      this.model,
      new StringOutputParser(),
    ]);


    const answerChain = RunnableSequence.from([
      {
        context: store.pipe(formatDocumentsAsString),
        question: new RunnablePassthrough(),
        customer_name: new RunnablePassthrough(),
        chat_history: new RunnablePassthrough(),

      },
      SELLER_ANSWER_PROMPT,
      this.model
    ]);


    const _runnable = standaloneQuestionChain.pipe(answerChain);
    this.runnableSeller = _runnable

    return _runnable
  }

  /**
   * Proceso para el agente que persuade y envia inidicaciones de ventas link etc
   * @param store 
   * @returns 
   */
  buildRunnableCloser(store: VectorStoreRetriever<HNSWLib | MemoryVectorStore>) {

    const standaloneQuestionChain = RunnableSequence.from([
      {
        question: (input: ConversationalRetrievalQAChainInput) => input.question,
        customer_name: (input: ConversationalRetrievalQAChainInput) => input.customer_name,
        chat_history: (input: ConversationalRetrievalQAChainInput) =>
          this.formatChatHistory(input.chat_history),
      },
      CONDENSE_QUESTION_PROMPT,
      this.model,
      new StringOutputParser(),
    ]);


    const answerChain = RunnableSequence.from([
      {
        context: store.pipe(formatDocumentsAsString),
        question: new RunnablePassthrough(),
        customer_name: new RunnablePassthrough(),

      },
      CLOSER_ANSWER_PROMPT,
      this.model
    ]);


    const _runnable = standaloneQuestionChain.pipe(answerChain);
    this.runnableCloser = _runnable
    return _runnable
  }

  /**
   * 
   * @param question 
   * @param chat_history 
   * @returns 
   */
  async toAsk(customerName: string, question: string, chat_history: History[] = []): Promise<string> {
    try {
      const { content } = await this.runnableSeller.invoke({
        question,
        customer_name: customerName,
        chat_history
      })
      return content
    } catch (error) {
      throw new Error('An error ocurred into return EXPERT_EXPLOYEE_FLOW')
    }
  }

  /**
   * 
   * @param customerName 
   * @param question 
   * @param chat_history 
   * @returns 
   */
  async toClose(customerName: string, question: string, chat_history: History[] = []): Promise<string> {
    try {
      const { content } = await this.runnableCloser.invoke({
        question,
        customer_name: customerName,
        chat_history
      })
      return content
    } catch (error) {
      throw new Error('An error ocurred into return EXPERT_EXPLOYEE_FLOW')
    }
  }
}

export { Runnable };