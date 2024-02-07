import "dotenv/config"
import type { Employee } from "@builderbot-plugins/openai-agents/dist/types";
import type { EmployeesClass } from "@builderbot-plugins/openai-agents/dist/plugin.employees";
import type FlowClass from "@bot-whatsapp/bot/dist/io/flowClass";
import { createFlow } from '@bot-whatsapp/bot';
import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { init } from '@builderbot-plugins/openai-agents';

import { ShopifyRunnable } from "../runnable";
import { Shopify } from "../shopify";
import { welcomeFlow } from "./flows/welcome.flow";
import { sellerFlow } from "./flows/seller.flow";

/** mover a tytpes */
type Settings = {
    modelName: string
    openApiKey: string
    shopifyApiKey: string
    shopifyDomain: string
}

/**
 * validacion y contruccion de argumentos
 * @param opts 
 * @returns 
 */
export const builderArgs = (opts: Settings): { employeesSettings: any, langchainSettings: any } => {
    const modelName = opts?.modelName ?? 'gpt-3.5-turbo-16k'
    const openApiKey = opts?.openApiKey ?? process.env.OPENAI_API_KEY ?? undefined
    const shopifyApiKey = opts?.shopifyApiKey ?? process.env.SHOPIFY_API_KEY ?? undefined
    const shopifyDomain = opts?.shopifyDomain ?? undefined

    if (!shopifyApiKey) {
        throw new Error(`shopifyApiKey - [SHOPIFY_API_KEY] not found`)
    }
    if (!openApiKey) {
        throw new Error(`openApiKey - [OPENAI_API_KEY] not found`)
    }
    if (!shopifyDomain) {
        throw new Error(`shopifyDomain not found`)
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
    }
}

/**
 * build agents flows
 * @param employeesAddon 
 * @returns 
 */
export const builderAgenstFlows = async (employeesAddon: EmployeesClass, shopify: Shopify): Promise<FlowClass> => {

    // const storeInfo = await shopify.getInfoStore() //aqui debemos tener una funcion asi que haga un http y solo obtena la info basica
    // lo hacemos al incio cunado se arranca el bot para evitar el delay fcunado alguien pregunte y tner la info lista

    const storeInfo = `Nombre de Comercio: PCComponents, ubicacion: direcion bla bla, numero de elefono, 9999999, web, etc`

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
            ].join(' '),
            flow: sellerFlow(),
        },
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
export const createShopifyFlow = async (opts: Settings): FlowClass => {
    const { employeesSettings, langchainSettings } = builderArgs(opts)

    const modelInstance = new ChatOpenAI(langchainSettings)
    const embeddingsInstace = new OpenAIEmbeddings(langchainSettings)

    const runnableInstance = new ShopifyRunnable(
        embeddingsInstace,
        modelInstance,
        opts.shopifyApiKey,
        opts.shopifyDomain
    )
    const shopifyInstance = new Shopify(runnableInstance)
    const employeesAddon = init(employeesSettings);

    const flowClassInstance = await builderAgenstFlows(employeesAddon, shopifyInstance)
    return flowClassInstance
}