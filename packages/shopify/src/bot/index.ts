import "dotenv/config"
import type { Employee } from "@builderbot-plugins/openai-agents/dist/types";
import type FlowClass from "@bot-whatsapp/bot/dist/io/flowClass";
import { createFlow } from '@bot-whatsapp/bot';
import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { init } from '@builderbot-plugins/openai-agents';

import { ShopifyRunnable } from "../runnable";
import { Shopify } from "../shopify";
import { welcomeFlow } from "./flows/welcome.flow";
import { sellerFlow } from "./flows/seller.flow";
import { expertFlow } from "./flows/expert.flow";
import { SmtartFlow } from "../types";

/** mover a tytpes */
type Settings = {
    openApiKey?: string
    shopifyApiKey?: string
    shopifyDomain?: string
    modelName?: string
    flows?: Employee[]
}

/**
 * validacion y contruccion de argumentos
 * @param opts 
 * @returns 
 */
export const builderArgs = (opts?: Settings|undefined): { 
    employeesSettings: any, langchainSettings: any,
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

    const employeesSettings = {
        model: modelName,
        temperature: 0,
        apiKey: openApiKey,
        ...opts
    };

    const langchainSettings = { modelName: modelName, openAIApiKey: openApiKey }

    return {
        employeesSettings,
        langchainSettings,
        openApiKey,
        shopifyApiKey,
        shopifyDomain
    }
}

/**
 * build agents flows
 * @param employeesAddon 
 * @returns 
 */
export const builderAgenstFlows = async (employeesAddon, shopify: Shopify, extra_flows: SmtartFlow[]): Promise<FlowClass> => {

    const storeInfo = await shopify.getStoreInfo() //aqui debemos tener una funcion asi que haga un http y solo obtena la info basica
    // lo hacemos al incio cunado se arranca el bot para evitar el delay fcunado alguien pregunte y tner la info lista

    const agentsFlows: Employee[] = [
        {
            name: "EMPLEADO_VENDEDOR",
            description: [
                `Soy Rob el vendedor amable encargado de atentender el comercio`,
                storeInfo,
                `\n Si tienes intencion de comprar o interesado en algun producto, mis respuestas son breves ideales para enviar por whatsapp.`
            ].join(' '),
            flow: sellerFlow(),
        },
        {
            name: "EMPLEADO_EXPERTO",
            description: [
                `Soy Pedro el encargado de darte informacion sobre algun producto o articulo en especifico que tenemos en nuestro inventario`,
                'O si bien tienes dudas sobre precio, detalles u otras caracteristicas'
            ].join(' '),
            flow: expertFlow(null, shopify),
        },
        ...extra_flows
    ]
    employeesAddon.employees(agentsFlows)
    const filterFlows = agentsFlows.map((f) => f.flow)

    const mergesFlows = [
        welcomeFlow(employeesAddon)
    ].concat(filterFlows)

    const flow = createFlow(mergesFlows)
    return flow
}

/**
 * @param opts 
 * @returns 
 */
export const createShopifyFlow = async (opts?: Settings) => { //
    const { employeesSettings, langchainSettings, openApiKey, shopifyApiKey, shopifyDomain } = builderArgs(opts)

    const modelInstance = new ChatOpenAI(langchainSettings)
    const embeddingsInstace = new OpenAIEmbeddings({
        openAIApiKey: openApiKey
    })

    const runnableInstance = new ShopifyRunnable(
        embeddingsInstace,
        modelInstance,
        shopifyApiKey, 
        shopifyDomain
    )
    const shopifyInstance = new Shopify(runnableInstance)
    const employeesAddon = init(employeesSettings);

    const flowClassInstance = await builderAgenstFlows(employeesAddon, shopifyInstance, opts?.flows ?? [])
    return flowClassInstance
}