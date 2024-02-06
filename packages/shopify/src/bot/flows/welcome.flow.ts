import { EVENTS, addKeyword } from "@bot-whatsapp/bot";
import { ActionPropertiesKeyword } from "@bot-whatsapp/bot/dist/types";


// opts = ['vendedor'], { sensitive: true } esto debe ser el valor por defecto pero que pueda sobreescribirse

const welcomeFlow = (keyword?: string | [string, ...string[]], options?: ActionPropertiesKeyword) => {
    const ACTION_OR_KEYWORD = keyword.length ? keyword : EVENTS.WELCOME

    return addKeyword(ACTION_OR_KEYWORD, options)
        .addAction(async (_, { state, flowDynamic }) => {
            const currentState = state.getMyState()
            return flowDynamic(`Hola soy el welcome siempre me activo cuando no exista otro flow que se dispare el 99% de las veces entro yo...`)
        })
}

export { welcomeFlow }