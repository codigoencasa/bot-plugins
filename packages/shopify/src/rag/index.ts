import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai"
import { Runnable } from "./runnable"
import { ClassManager } from "../ioc"
import { Channel } from "../channels/respository"
import { RunnableSequence } from "@langchain/core/runnables"
import { VectorStoreRetriever } from "@langchain/core/vectorstores"

/**
 * todo lo de inicializar, no debe sabe nada de channels
 * @param openApiKey 
 * @param modelName 
 */
const initRag = async (openApiKey: string, modelName: string,): Promise<{ runCloser: RunnableSequence<any, any>, runSeller: RunnableSequence<any, any>, docs: VectorStoreRetriever }> => {

    const channelInstance = ClassManager.hub().get<Channel>('channel')

    const modelInstance = new ChatOpenAI({
        openAIApiKey: openApiKey,
        modelName: modelName,
        temperature: 0
    })

    const embeddingsInstace = new OpenAIEmbeddings({ openAIApiKey: openApiKey })
    const runnableInstance = new Runnable(channelInstance, embeddingsInstace, modelInstance)

    ClassManager.hub().add('modelInstance', modelInstance)
    ClassManager.hub().add('embeddingsInstace', embeddingsInstace)
    ClassManager.hub().add('runnable', runnableInstance)

    const docs = await runnableInstance.buildStore(10)
    const runSeller = runnableInstance.buildRunnableSeller(docs)
    const runCloser = runnableInstance.buildRunnableCloser(docs)

    return { runSeller, runCloser, docs }


}

export { initRag }