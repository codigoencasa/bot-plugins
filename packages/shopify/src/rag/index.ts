import { Runnable } from "./runnable"
import { ClassManager } from "../ioc"
import { Channel } from "../channels/respository"
import { RunnableSequence } from "@langchain/core/runnables"
import { VectorStoreRetriever } from "@langchain/core/vectorstores"
import { BaseChatModel } from "@langchain/core/language_models/chat_models"
import { Embeddings } from "@langchain/core/embeddings"
import { StoreRetriever } from "../types"

/**
 * todo lo de inicializar, no debe sabe nada de channels
 * @param openApiKey 
 * @param modelName 
 */

/** TE PROPONGO LA IDEA DE DESACOPLAR EL MODELO PARA PODER TENER LIBERTAD DE ESCOGER CON CUAL ENTREGAMOS LA DATA */
const initRag = async (): Promise<{ runCloser: RunnableSequence<any, any>, runSeller: RunnableSequence<any, any>, docs: StoreRetriever }> => {

    const channelInstance = ClassManager.hub().get<Channel>('channel')

    const modelInstance = ClassManager.hub().get<BaseChatModel>('modelInstance')
    const embeddingInstance = ClassManager.hub().get<Embeddings>('embeddingInstance')

    const runnableInstance = new Runnable(channelInstance, embeddingInstance, modelInstance)

    ClassManager.hub().add('runnable', runnableInstance)

    /** Creo que lei por ahi que el K > 6 crea hallucinations pero ya iremos probando */
    const docs = await runnableInstance.buildStore(10)
    const runSeller = runnableInstance.buildRunnableSeller(docs)
    const runCloser = runnableInstance.buildRunnableCloser(docs)

    return { runSeller, runCloser, docs }


}

export { initRag }