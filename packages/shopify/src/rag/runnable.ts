import { Embeddings } from "@langchain/core/embeddings";
import { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { StringOutputParser } from "@langchain/core/output_parsers";
import {
  RunnableSequence,
  RunnablePassthrough,
  RunnableLambda,
} from "@langchain/core/runnables";
import { formatDocumentsAsString } from "langchain/util/document";

import CustomCallbacks, { getProductNameFromQuestion } from "./callbacks/retriever";
import { CONDENSE_QUESTION_PROMPT, CLOSER_ANSWER_PROMPT, SELLER_ANSWER_PROMPT } from "./prompts";
import { storeManager } from "./store";
import { History } from "../bot/utils/handleHistory";
import { Channel } from "../channels/respository";
import { ConversationalRetrievalQAChainInput, StoreRetriever } from "../types";
import { cleanAnswer } from "../utils/cleanAnswer";
import { ClassManager } from "../ioc";

/**
 * esta clase no debe saber nada de shopify ni wordpress, esto solo debe saber de unos metodos genericos
 * para obtener la info de las "tiendas"
 */
class Runnable {

  public runnableSeller: RunnableSequence<ConversationalRetrievalQAChainInput, any>
  public runnableCloser: RunnableSequence<ConversationalRetrievalQAChainInput, any>
  private data: StoreRetriever
  private language: string

  constructor(
    private channel: Channel,
    private embeddingModel: Embeddings,
    private model: BaseChatModel
  ) {
    this.language = ClassManager.hub().get('language')
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
  public async buildStore(k = 4): Promise<StoreRetriever> {

    const vectorStore = await storeManager(this.channel)
    const asRetriever = vectorStore.asRetriever()
    this.data = asRetriever
    return asRetriever
  }

  private async callContext (question: string) {
    const store = await storeManager(this.channel)
    const product_name = await getProductNameFromQuestion(question)
    const result = await store.asRetriever().pipe(formatDocumentsAsString).invoke(product_name, {
      callbacks: [{
         async handleRetrieverEnd(documents) {
           return new CustomCallbacks().handleRetrieverEnd(product_name, documents)
         }
      }]
    })
    

    return result
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
  // @typescript-eslint/no-unused-vars
  buildRunnableSeller(_: StoreRetriever) {

    const standaloneQuestionChain = RunnableSequence.from([
      {
        question: (input: ConversationalRetrievalQAChainInput) => input.question,
        customer_name: (input: ConversationalRetrievalQAChainInput) => input.customer_name,
        chat_history: (input: ConversationalRetrievalQAChainInput) =>
          this.formatChatHistory(input.chat_history),
        langugage: (input: ConversationalRetrievalQAChainInput) => input.language
      },
      CONDENSE_QUESTION_PROMPT,
      this.model,
      new StringOutputParser(),
    ]);


    const answerChain = RunnableSequence.from([
      {
        // store.pipe(formatDocumentsAsString)
        context: new RunnableLambda({
          func: this.callContext
        }),
        question: new RunnablePassthrough(),
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
  buildRunnableCloser(store: StoreRetriever) {

    const standaloneQuestionChain = RunnableSequence.from([
      {
        question: (input: ConversationalRetrievalQAChainInput) => input.question,
        customer_name: (input: ConversationalRetrievalQAChainInput) => input.customer_name,
        chat_history: (input: ConversationalRetrievalQAChainInput) =>
          this.formatChatHistory(input.chat_history),
        langugage: (input: ConversationalRetrievalQAChainInput) => input.language
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
        language: new RunnablePassthrough()
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
      let { content } = await this.runnableSeller.invoke({
        question,
        customer_name: customerName,
        chat_history,
        language: this.language,
      })
      
      return cleanAnswer(content)
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
        chat_history,
        language: this.language
      })
      return content.replace(/\[(\w|\s|\W)*\]/g, '').replace(/(!|\(|\))/g, '').trim()
    } catch (error) {
      console.log({ error })
      return 'Lo siento, no pude resolver tu consulta'
    }
  }
}

export { Runnable };