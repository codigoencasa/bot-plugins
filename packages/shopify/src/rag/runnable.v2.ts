import { Embeddings } from "@langchain/core/embeddings";
import { BaseChatModel } from "@langchain/core/language_models/chat_models";
import {
  RunnableSequence,
  RunnablePassthrough,
} from "@langchain/core/runnables";
import { storeManager } from "./store";
import { Channel } from "../channels/respository";
import { ConversationalRetrievalQAChainInput, StoreRetriever } from "../types";
import { contextualizeQChain } from "./manager";
import { INFO_ANSWER_PROMPT_V2, SELLER_ANSWER_PROMPT, SELLER_ANSWER_PROMPT_V2 } from "./prompts/seller/prompt";
import { cleanAnswer } from "../utils/cleanAnswer";
import { getHistory, handleHistory } from "../bot/utils/handleHistory";

/**
 * esta clase no debe saber nada de shopify ni wordpress, esto solo debe saber de unos metodos genericos
 * para obtener la info de las "tiendas"
 */
class RunnableV2 {

  public runnableSeller: RunnableSequence<ConversationalRetrievalQAChainInput, any>
  public runnableCloser: RunnableSequence<ConversationalRetrievalQAChainInput, any>

  constructor(
    private channel: Channel,
    private embeddingModel: Embeddings,
    private model: BaseChatModel
  ) {

  }


  /**
   * 
   * @param k num files
   * @returns 
   */
  public async buildStore(k = 4): Promise<StoreRetriever> {

    const vectorStore = await storeManager(this.channel);
    return vectorStore.asRetriever(k);
  }

  async buildInfoRetriever (context: any) {
      return RunnableSequence.from([
          RunnablePassthrough.assign({
            context: async (input: Record<string, unknown>) => {
              console.log('input: ', input.question)
              console.log('context: ', context)
              return context
          }
          }),
          INFO_ANSWER_PROMPT_V2,
          this.model
        ])
  }


  /**
   * proceso para el agente encargado de dar informacion sobre un producto
   * @returns 
   */
  // @typescript-eslint/no-unused-vars
  async buildRunnable(retriever: StoreRetriever, llm: BaseChatModel) {
    return RunnableSequence.from([
        RunnablePassthrough.assign({
          context: async (input: Record<string, unknown>) => {
              console.log('input: ', input.question)
              const chain = contextualizeQChain(llm)
              let context: any = await chain.pipe(retriever).invoke({
                chat_history: input.chat_history,
                question: input.question
              })

              context = context
                .filter(doc => doc.metadata._distance && doc.metadata._distance <= .7)
                .map(doc => doc.pageContent).join('\n')
                
              console.log('context', context)
              return context
          }
        }),
        SELLER_ANSWER_PROMPT_V2,
        llm
      ])

  }
  /**
   * 
   * @param question 
   * @param chat_history 
   * @returns 
   */
  async toAsk(customer_name: string, question: string, state: any): Promise<string> {
    try {
      const chat_history = getHistory(state) || []
      const runnable = await this.buildRunnable(await this.buildStore(4), this.model)

      const aiMsg = await runnable.invoke({
        question,
        chat_history,
        language: 'spanish',
      })
      await handleHistory(aiMsg, state)
      return cleanAnswer(aiMsg.content as string)
    } catch (error) {
      console.log({ error })
      throw new Error('An error ocurred into return EXPERT_EXPLOYEE_FLOW')
    }
  }

  async toInfo(question: string, context: any, state: any) {
    try {
      const chat_history = getHistory(state) || []
      const runnable = await this.buildInfoRetriever(context)

      const aiMsg = await runnable.invoke({
        question,
        chat_history,
        language: 'spanish',
      })
      await handleHistory(aiMsg, state)
      return cleanAnswer(aiMsg.content as string)
    } catch (error) {
      console.log({ error })
      throw new Error('An error ocurred into return EXPERT_EXPLOYEE_FLOW')
    }
  }

}

export { RunnableV2 };