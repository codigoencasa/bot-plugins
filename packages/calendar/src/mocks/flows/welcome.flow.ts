import { EVENTS, addKeyword } from "@builderbot/bot";
import runnable from "../../rag/runnable";

import { isDateReserved } from "../../utils/date.fn";
import { RESERVED_DATES, addEvent, getReserves } from "../api";

export default addKeyword(EVENTS.WELCOME)
    .addAction(async (ctx, { flowDynamic }) => {
        let date = (await runnable.invoke({
            question: ctx.body
        })).replace('date: ', '').trim()

        console.log(date)

        if (date) {
            const isReserved = isDateReserved(date, RESERVED_DATES)
            // SI ESTA RESERVADO DEBERIA PODER PEDIR OTRA FECHA
            console.log(date, isReserved)
            
            if (isReserved) {
                const reserves = getReserves(date)
                return await flowDynamic(`Le indicamos que no contamos con disponibilidad en las siguientes fechas: \n\n${reserves}`)
            }
        }

        // SE AGREGO LA FECHA CON EXITO
        addEvent(date)
        await flowDynamic('Gracias!, ya hemos reservado la fecha, cualquier cambio, recuerde notificar al administrador')
    })

