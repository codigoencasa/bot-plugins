import { EVENTS, addKeyword } from "@bot-whatsapp/bot";
import { ActionPropertiesKeyword } from "@bot-whatsapp/bot/dist/types";
import { Shopify } from "../../shopify";


// opts = ['vendedor'], { sensitive: true } esto debe ser el valor por defecto pero que pueda sobreescribirse

const welcomeFlow = (pluginAi: any) => {
    return  addKeyword(EVENTS.WELCOME)
    /** Aqui podemos agregar validaciones respecto a si es un usuario nuevo o lo tenemos en el dia de hoy */
    .addAction(null, (_, {flowDynamic}) => {
        flowDynamic('Hola Bienvenido a mi tienda es un gusto saludarte, deseas saber sobre productos?')
    })
    .addAction(async (ctx, ctxFn) => {
        const {state} = ctxFn
        const mensajeEntrante = ctx.body //buenas me interesa el curso de nodejs
        const empleadoIdeal = await pluginAi.determine(mensajeEntrante)
      
        if(!empleadoIdeal?.employee){
          return ctxFn.flowDynamic('Ups lo siento no te entiendo ¿Como puedo ayudarte?')
        }
        state.update({answer:empleadoIdeal.answer})
        pluginAi.gotoFlow(empleadoIdeal.employee, ctxFn)
      
      })
}

export { welcomeFlow }