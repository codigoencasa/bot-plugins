import "dotenv/config"

import { createFlow } from '@bot-whatsapp/bot';
import { init } from 'bot-ws-plugin-openai';

import { expertFlow } from './flows/expert.flow';
import { faqFlow } from "./flows/faq.flow";
import { humanFlow } from "./flows/human.flow";
import { welcomeFlow } from './flows/welcome.flow';
import { Shopify } from '../shopify';
import { SmtartFlow } from "../types";


// Overload 1: No arguments
export function createShopifyFlow(): { employeesAddon: any, flow: any };

// Overload 2: Only args parameter
export function createShopifyFlow(args: SmtartFlow[]): { employeesAddon: any, flow: any };

// Overload 3: Only opts parameter
export function createShopifyFlow(opts: any): { employeesAddon: any, flow: any };

// Overload 4: args and opts parameters
export function createShopifyFlow(args: SmtartFlow[], opts: any): { employeesAddon: any, flow: any };

// Overload 5: only callback
// @ts-ignore
export function createShopifyFlow(humanCb: () => Promise<void>): { employeesAddon: any, flow: any };

// Overload 6: args, opts, and humanCb parameters
export function createShopifyFlow(args?: SmtartFlow[], opts?: any, humanCb?: () => Promise<void>): { employeesAddon: any, flow: any };


/**
 * La idea es que esta funcion se la unica que se llama que tenga todo para funcionar pero siq que alguien con experiencia
 * quiere hacer cosas las pueda hacer
 * 
 * Puede sobreescribir los flows para mejorarlos a su gusto
 * y puedes ajustas modelo y demas a su gusto
 * 
 * @param args 
 * 
 * @example
 * createShopifyFlow([{
            name: "EMPLEADO_VENDEDOR",
            description:
                "Soy Rob el vendedor amable encargado de atentender si tienes intencion de comprar o interesado en algun producto, mis respuestas son breves.",
            flow: welcomeFlow,
        }], { maxTokens: 500 }, async () => await some_function() )
 * @returns 
 */
export function createShopifyFlow(args?: SmtartFlow[], opts?: any, humanCb?: () => Promise<void>) {
    const variables = Object.values(arguments)
    args = variables.find(a => Array.isArray(a)) || []
    opts = variables.find(a => !Array.isArray(a) && Object.values(a || {}).length) || {}
    humanCb = variables.find(a => typeof a === 'function') || function agente() { console.log('agente') }

    const employeesAddonConfig = {
        model: "gpt-3.5-turbo-16k",
        temperature: 0,
        apiKey: process.env.OPENAI_API_KEY,
        ...opts
    };


    const runnable = new Shopify({
        model: "gpt-3.5-turbo-16k",
        temperature: 0,
        openAIApiKey: process.env.OPENAI_API_KEY,
        shopifyApyKey: process.env.SHOPIFY_API_KEY,
        shopifyCookie: process.env.SHOPIFY_COOKIE
    })

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
        {
            name: "EMPLEADO_HUMANO",
            description:
                "Soy Teresa encargada de responder cuando el usuario necesita hablar con un agente.",
            flow: humanFlow(humanCb),
        },
        ...args
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