import { Embeddings } from "@langchain/core/embeddings";
import { BaseChatModel } from "@langchain/core/language_models/chat_models";
import {
  RunnableSequence,
  RunnablePassthrough,
} from "@langchain/core/runnables";
import { storeManager } from "./store";
import { History } from "../bot/utils/handleHistory";
import { Channel } from "../channels/respository";
import { ConversationalRetrievalQAChainInput, StoreRetriever } from "../types";
import { contextualizeQChain } from "./manager";
import { SELLER_ANSWER_PROMPT } from "./prompts/seller/prompt";
import { cleanAnswer } from "../utils/cleanAnswer";

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


  /**
   * proceso para el agente encargado de dar informacion sobre un producto
   * @returns 
   */
  // @typescript-eslint/no-unused-vars
  async buildRunnable(retriever: StoreRetriever, llm: BaseChatModel) {
    return RunnableSequence.from([
        RunnablePassthrough.assign({
          context: async (input: Record<string, unknown>) => {
              console.log('input: ', input)
              const chain = contextualizeQChain(llm)
              let context: any = await chain.pipe(retriever).invoke({
                chat_history: input.chat_history,
                question: input.question
              })

              context = context
                .filter(doc => doc.metadata._distance && doc.metadata._distance <= .4)
                .map(doc => doc.pageContent).join('\n')

              console.log('context', context)
              return context
          }
        }),
        SELLER_ANSWER_PROMPT,
        llm
      ])

  }
  /**
   * 
   * @param question 
   * @param chat_history 
   * @returns 
   */
  async toAsk(customer_name: string, question: string, chat_history: History[] = []): Promise<string> {
    
    try {
      const runnable = await this.buildRunnable(await this.buildStore(4), this.model)

      const aiMsg = await runnable.invoke({
        question,
        chat_history: Array.isArray(chat_history) ? chat_history : [chat_history]
      })

      return cleanAnswer(aiMsg.content as string)
    } catch (error) {
      console.log({ error })
      throw new Error('An error ocurred into return EXPERT_EXPLOYEE_FLOW')
    }
  }

}

export { RunnableV2 };