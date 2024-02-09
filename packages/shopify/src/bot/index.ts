import "dotenv/config"
import { welcomeFlow } from "./flows/welcome.flow";
import { Settings } from "../types";
import { TFlow } from "@bot-whatsapp/bot/dist/types";
import { ClassManager } from "../ioc";
import { EmployeesClass } from "@builderbot-plugins/openai-agents";
import { buildAgents, builderArgs } from "./methods";
import { initRag } from "../rag";
import { Shopify } from "../channels/shopify";

/**
 * @param opts 
 * @returns 
 */
export const createShopifyFlow = async (opts?: Settings): Promise<TFlow[]> => {
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

    ClassManager.hub().add('channel', channelInstance)

    /** rag */
    initRag(openApiKey, modelName)

    /** output */

    const agentsFlows = await buildAgents()
    const mergesFlows = [welcomeFlow()]

    for (const { flow } of agentsFlows) {
        mergesFlows.push(flow)
    }

    return mergesFlows
}