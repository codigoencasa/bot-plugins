import "dotenv/config"
import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { Employee } from "@builderbot-plugins/openai-agents/dist/types";
import { TFlow } from "@builderbot/bot/dist/types";
import { EmployeesClass } from "@builderbot-plugins/openai-agents";

import { welcomeFlow } from "./flows/welcome.flow";
import { buildAgents, builderArgs } from "./methods";
import { ClassManager } from "../ioc";
import { initRag } from "../rag";
import { Shopify } from "../channels/shopify";
import { DevSettings, Settings } from "../types";
/** Importamos el modelo y embedding por default */

/**
 * @param opts 
 * @returns 
 */
export const createShopifyFlow = async (opts?: Settings, extra?: DevSettings): Promise<{
    flow: TFlow[],
    agents: Employee[]
}> => {
    const { openApiKey, modelName, shopifyApiKey, shopifyDomain } = builderArgs(opts)


    /** agentes */
    const emplyeeInstace = new EmployeesClass({
        apiKey: openApiKey,
        model: modelName,
        temperature: 0
    })

    ClassManager.hub().add('employees', emplyeeInstace)


    /** channel */
    /** luego hacemos algo para aceptar diferente channel (woocomerce, amazon, shopify, etc...) */
    const channelInstance = new Shopify(shopifyApiKey, shopifyDomain)
    const modelInstance = extra?.modelInstance ?? new ChatOpenAI({
        openAIApiKey: openApiKey
    })

    const embeddingInstance = extra?.embeddingInstance ?? new OpenAIEmbeddings({
        openAIApiKey: openApiKey
    })

    /** Si exponemos el modelo y los embeddings desde afuera damos mayor libertad a los dev de ir testeando conffiguraciones que pasemos por alto */
    ClassManager.hub().add('language', extra?.language || 'english')
    ClassManager.hub().add('modelInstance', modelInstance)
    ClassManager.hub().add('embeddingInstance', embeddingInstance)
    ClassManager.hub().add('channel', channelInstance)
    ClassManager.hub().add('storeInformation', extra?.storeInformation || null)


    /** rag */
    /** Algo mas limpio quizas mas adelante extraigamos el runnable para desacoplarlo de la inferencia de datos */
    await initRag()
    /** output */

    const agentsFlows = await buildAgents()
    const agents = [...agentsFlows, ...extra?.flows ?? []]

    emplyeeInstace.employees(agents)

    const flow = [welcomeFlow()]

    for (const singleFlow of agents) {
        flow.push(singleFlow.flow)
    }

    return { flow, agents }
}