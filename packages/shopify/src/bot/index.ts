import "dotenv/config"

import { createFlow } from '@bot-whatsapp/bot';
import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { init } from "@builderbot-plugins/openai-agents";
import { expertFlow } from './flows/expert.flow';
import { faqFlow } from "./flows/faq.flow";
import { ShopifyRunnable } from "../runnable";
import { AddonConfig, Options } from "../types";
import { welcomeFlow } from "./flows/welcome.flow";
import { humanFlow } from "./flows/human.flow";


/**
 * TODO tipar opts
 * @param opts 
 * @returns 
 */
export function createShopifyFlow(opts?: Options, extraConf?: AddonConfig|undefined) {

    const employeesAddonConfig = {
        model: "gpt-3.5-turbo-16k",
        temperature: 0,
        apiKey: process.env.OPENAI_API_KEY,
        ...opts
    };

    const model = new ChatOpenAI()
    const embeddings = new OpenAIEmbeddings()

    const runnable = new ShopifyRunnable(
        embeddings,
        model,
        extraConf?.shopifyApyKey || process.env.SHOPIFY_API_KEY,
        extraConf?.shopifyCookie || process.env.SHOPIFY_COOKIE
    )



    if (['OPENAI_API_KEY', 'SHOPIFY_API_KEY', 'SHOPIFY_COOKIE'].some(e => !Object.keys(process.env).includes(e))) {
        throw new Error('Setea las siguientes env en tu archivo .env\n${OPENAI_API_KEY=}\n${SHOPIFY_API_KEY=}\${SHOPIFY_COOKIE=}')
    }

    const employeesAddon = init(employeesAddonConfig);

    const arrayFlows = [
        {
            name: "EMPLEADO_VENDEDOR",
            description:
                "Soy Rob el vendedor amable encargado de atentender si tienes intencion de comprar o interesado en algun producto, mis respuestas son breves.",
            flow: welcomeFlow(employeesAddon),
        },
        {
            name: "EMPLEADO_EXPERTO",
            description:
                "Soy Marcus el experto cuando de dar detalles sobre los productos de mi tienda se trata, me encargo de responder preguntas sobre los productos, mis respuestas son breves.",
            flow: expertFlow(runnable),
        },
        {
            name: "EMPLEADO_FAq",
            description:
                "Soy Tom el que tiene las respuesta, me encargo de responder preguntas sobre mi negocio o tienda, mis respuestas son breves.",
            flow: faqFlow(),
        },
        ...extraConf?.flows
    ]

    if (extraConf?.callbackAgent) {
        arrayFlows.push(
            {
                name: "EMPLEADO_HUMANO",
                description:
                    "Soy Teresa encargada de responder cuando el usuario necesita hablar con un agente.",
                flow: humanFlow(extraConf.callbackAgent),
            }
            )
    }

    employeesAddon.employees(arrayFlows)

    const filterFlows = arrayFlows.map((f) => f.flow)
    const flow = createFlow(filterFlows)
    return { employeesAddon, flow }
}