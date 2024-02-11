import "dotenv/config"
import { welcomeFlow } from "./flows/welcome.flow";
import { Settings } from "../types";
import { TFlow } from "@bot-whatsapp/bot/dist/types";
import { ClassManager } from "../ioc";
import { EmployeesClass } from "@builderbot-plugins/openai-agents";
import { buildAgents, builderArgs } from "./methods";
import { initRag } from "../rag";
import { Shopify } from "../channels/shopify";
/** Importamos el modelo y embedding por default */
import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { Employee } from "@builderbot-plugins/openai-agents/dist/types";

/**
 * @param opts 
 * @returns 
 */
export const createShopifyFlow = async (opts?: Settings): Promise<{
    mergesFlows: TFlow[],
    mergesBuildAgents: Employee[]
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
    const modelInstance = opts?.modelInstance ?? new ChatOpenAI({
        openAIApiKey: openApiKey
    })

    const embeddingInstance = opts?.embeddingInstance ?? new OpenAIEmbeddings({
        openAIApiKey: openApiKey
    })

    /** Si exponemos el modelo y los embeddings desde afuera damos mayor libertad a los dev de ir testeando conffiguraciones que pasemos por alto */
    ClassManager.hub().add('modelInstance', modelInstance)
    ClassManager.hub().add('embeddingInstance', embeddingInstance)
    ClassManager.hub().add('channel', channelInstance)


    /** rag */
    /** Algo mas limpio quizas mas adelante extraigamos el runnable para desacoplarlo de la inferencia de datos */
    await initRag()
    /** output */

    const agentsFlows = await buildAgents()
    const mergesBuildAgents = [...agentsFlows, ...opts?.flows ?? []]

    emplyeeInstace.employees(mergesBuildAgents)

    const mergesFlows = [welcomeFlow()]

    for (const { flow } of mergesBuildAgents) {
        mergesFlows.push(flow)
    }

    return { mergesFlows, mergesBuildAgents }
}