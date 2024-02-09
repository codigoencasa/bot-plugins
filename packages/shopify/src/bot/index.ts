import "dotenv/config"
import type FlowClass from "@bot-whatsapp/bot/dist/io/flowClass";
import { EVENTS, addKeyword, createFlow } from '@bot-whatsapp/bot';
import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";

import { ShopifyRunnable } from "../runnable";
import { Shopify } from "../shopify";
import { welcomeFlow } from "./flows/welcome.flow";
import { Settings, SmtartFlow } from "../types";
import { TFlow } from "@bot-whatsapp/bot/dist/types";
import { ClassManager } from "../ioc";
import { Employee } from "@builderbot-plugins/openai-agents/dist/types";
import { EmployeesClass } from "@builderbot-plugins/openai-agents";
import sellerFlow from "./flows/seller.flow";
import expertFlow from "./flows/expert.flow";

/**
 * Encargara de validar los argumentos de las dependencias
 * @param opts 
 * @returns 
 */
export const builderArgs = (opts?: Settings | undefined): {
    modelName: string
    openApiKey: string,
    shopifyApiKey: string,
    shopifyDomain: string
} => {

    const modelName = opts?.modelName ?? 'gpt-3.5-turbo-16k'
    const openApiKey = opts?.openApiKey ?? process.env.OPENAI_API_KEY ?? undefined
    const shopifyApiKey = opts?.shopifyApiKey ?? process.env.SHOPIFY_API_KEY ?? undefined
    const shopifyDomain = opts?.shopifyDomain ?? process.env.SHOPIFY_DOMAIN ?? undefined

    if (!shopifyApiKey) {
        throw new Error(`shopifyApiKey - enviroment [SHOPIFY_API_KEY] not found`)
    }
    if (!openApiKey) {
        throw new Error(`openApiKey - enviroment [OPENAI_API_KEY] not found`)
    }
    if (!shopifyDomain) {
        throw new Error(`shopifyDomain - enviroment [SHOPIFY_DOMAIN] not found`)
    }
    return {
        modelName,
        openApiKey,
        shopifyApiKey,
        shopifyDomain
    }
}

/**
 * Encargada de construir los agentes
 * @param employeesAddon 
 * @returns 
 */
export const builderAgenstFlows = async (): Promise<Employee[]> => {

    const shopify = ClassManager.hub().get<Shopify>('shopify')
    const infoStore = await shopify.getStoreInfo()

    const agentsFlows: Employee[] = [
        {
            name: "EMPLEADO_VENDEDOR",
            description: [
                `Soy Rob el vendedor amable encargado de atentender el comercio`,
                infoStore,
                `\n Si tienes intencion de comprar o interesado en algun producto, mis respuestas son breves ideales para enviar por whatsapp.`
            ].join(' '),
            flow: sellerFlow,
        },
        {
            name: "EMPLEADO_EXPERTO",
            description: [
                `Soy Pedro el encargado de darte informacion sobre algun producto o articulo en especifico que tenemos en nuestro inventario`,
                'O si bien tienes dudas sobre precio, detalles u otras caracteristicas'
            ].join(' '),
            flow: expertFlow,
        }
    ]
    return agentsFlows
}

/**
 * @param opts 
 * @returns 
 */
export const createShopifyFlow = async (opts?: Settings): Promise<TFlow[]> => {
    const { openApiKey, modelName } = builderArgs(opts)

    /**
     * Compartiremos un instanciamiento unico de las dependencias
     */

    const emplyeeInstace = new EmployeesClass({
        apiKey: openApiKey,
        model: modelName,
        temperature: 0
    })

    const shopifyInstance = new Shopify()

    ClassManager.hub().add('shopify', shopifyInstance)
    ClassManager.hub().add('employees', emplyeeInstace)

    /** RAG */
    const modelInstance = new ChatOpenAI()
    const embeddingsInstace = new OpenAIEmbeddings()
    const runnableInstance = new ShopifyRunnable(embeddingsInstace, modelInstance)

    ClassManager.hub().add('modelInstance', modelInstance)
    ClassManager.hub().add('embeddingsInstace', embeddingsInstace)
    ClassManager.hub().add('runnableInstance', runnableInstance)

    const agentsFlows = await builderAgenstFlows()

    emplyeeInstace.employees(agentsFlows)


    const mergesFlows = [welcomeFlow()]

    for (const { flow } of agentsFlows) {
        mergesFlows.push(flow)
    }

    return mergesFlows
}