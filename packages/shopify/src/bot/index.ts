import "dotenv/config"

import { createFlow } from '@bot-whatsapp/bot';
import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { init } from 'bot-ws-plugin-openai';

// import { expertFlow } from './flows/expert.flow';
// import { faqFlow } from "./flows/faq.flow";
import { ShopifyRunnable } from "../runnable";

/**
 * TODO tipar opts
 * @param opts 
 * @returns 
 */
export function createShopifyFlow(opts?: any) {
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
        this.addonConfig.shopifyApyKey,
        this.addonConfig.shopifyCookie
    )


    console.log(runnable)

    if (['OPENAI_API_KEY', 'SHOPIFY_API_KEY', 'SHOPIFY_COOKIE'].some(e => !Object.keys(process.env).includes(e))) {
        throw new Error('Setea las siguientes env en tu archivo .env\n${OPENAI_API_KEY=}\n${SHOPIFY_API_KEY=}\${SHOPIFY_COOKIE=}')
    }

    const employeesAddon = init(employeesAddonConfig);

    const arrayFlows = [
        // {
        //     name: "EMPLEADO_VENDEDOR",
        //     description:
        //         "Soy Rob el vendedor amable encargado de atentender si tienes intencion de comprar o interesado en algun producto, mis respuestas son breves.",
        //     flow: welcomeFlow(employeesAddon),
        // },
        // {
        //     name: "EMPLEADO_EXPERTO",
        //     description:
        //         "Soy Marcus el experto cuando de dar detalles sobre los productos de mi tienda se trata, me encargo de responder preguntas sobre los productos, mis respuestas son breves.",
        //     flow: expertFlow(runnable),
        // },
        // {
        //     name: "EMPLEADO_FAq",
        //     description:
        //         "Soy Tom el que tiene las respuesta, me encargo de responder preguntas sobre mi negocio o tienda, mis respuestas son breves.",
        //     flow: faqFlow(),
        // },
        // {
        //     name: "EMPLEADO_HUMANO",
        //     description:
        //         "Soy Teresa encargada de responder cuando el usuario necesita hablar con un agente.",
        //     flow: humanFlow(humanCb),
        // },
        // ...args
        // {
        //     name: "EMPLEADO_EXPERTO",
        //     description:
        //         "Saludos, mi nombre es Leifer.Soy el engargado especializado en resolver tus dudas sobre nuestro curso de chatbot, el cual está desarrollado con Node.js y JavaScript. Este curso está diseñado para facilitar la automatización de ventas en tu negocio. Te proporcionaré respuestas concisas y directas para maximizar tu entendimiento.",
        //     flow: expertoFlow,
        // },
        // {
        //     name: "EMPLEADO_PAGAR",
        //     description:
        //         "Saludos, mi nombre es Juan encargado de generar los links de pagos necesarios cuando un usuario quiera hacer la recarga de puntos a la plataforma de cursos.",
        //     flow: pagarFlow,
        // }
    ]
    employeesAddon.employees(arrayFlows)

    const filterFlows = arrayFlows.map((f) => f.flow)
    const flow = createFlow(filterFlows)
    return { employeesAddon, flow }
}