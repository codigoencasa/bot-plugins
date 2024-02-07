# Openai plugin for extension create bot

## Usage

```ts
import "dotenv/config"
import {
  createBot,
  createProvider,
  createFlow,
} from "@bot-whatsapp/bot";

import BaileysProvider from "@bot-whatsapp/provider/baileys";
import MockAdapter from "@bot-whatsapp/database/mock";

import welcomeFlow from "./flows/welcome.flow";
import vendedorFlow from './flows/vendedor.flow';
import expertoFlow from './flows/experto.flow';
import pagarFlow from './flows/pagar.flow';

import {init} from '@builderbot-plugins/openai-agents';
import ServerAPI from './http';
/**
 * Configuracion de Plugin
 */
const employeesAddonConfig = {
  model: "gpt-3.5-turbo-16k",
  temperature: 0,
  apiKey: process.env.OPENAI_API_KEY,
};
const employeesAddon = init(employeesAddonConfig);

employeesAddon.employees([
  {
    name: "EMPLEADO_VENDEDOR",
    description:
      "Soy Rob el vendedor amable encargado de atentender si tienes intencion de comprar o interesado en algun producto, mis respuestas son breves.",
    flow: vendedorFlow,
  },
  {
    name: "EMPLEADO_EXPERTO",
    description:
      "Saludos, mi nombre es Leifer.Soy el engargado especializado en resolver tus dudas sobre nuestro curso de chatbot, el cual está desarrollado con Node.js y JavaScript. Este curso está diseñado para facilitar la automatización de ventas en tu negocio. Te proporcionaré respuestas concisas y directas para maximizar tu entendimiento.",
    flow: expertoFlow,
  },
  {
    name: "EMPLEADO_PAGAR",
    description:
      "Saludos, mi nombre es Juan encargado de generar los links de pagos necesarios cuando un usuario quiera hacer la recarga de puntos a la plataforma de cursos.",
    flow: pagarFlow,
  }
])

/**
 * 
 */


const main = async () => {
  const adapterDB = new MockAdapter();
  const adapterFlow = createFlow([
    welcomeFlow,
    vendedorFlow,
    expertoFlow,
    pagarFlow
  ]);
  
  const adapterProvider = createProvider(BaileysProvider);

  const httpServer = new ServerAPI(adapterProvider, adapterDB)

  const configBot = {
    flow: adapterFlow,
    provider: adapterProvider,
    database: adapterDB,
  }

  const configExtra = {
    extensions:{
      employeesAddon
    }
  }

  await createBot(configBot,configExtra);
  httpServer.start()
};

main();
```

## Author

Elimeleth Capuano <https://github.com/elimeleth>
