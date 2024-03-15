import { createReserve, endDate } from "../../utils/date.fn"

export const RESERVED_DATES = {}


// RETORNA LAS RESERVAS NO DISPONIBLES
export const getReserves = (event: string) => {
    return Object.entries(RESERVED_DATES)
        .filter(([key, _]) => {
            return key.includes(event.split(' ')[0])
        })
        .map(([key, _]) => `${key} - ${endDate(key)}`)
        .join('\n')
}

// RETORNA LOS RESERVAS CON SU TIEMPO DE DURACION
export const getEvents = () => {
    return Object.entries(RESERVED_DATES)
        .map(([key, value]) => `${key}: ${value}`)
        .join('\n----------\n')
}

// event: AGREGA UNA RESERVA
export const addEvent = (event: string) => {
    const date = createReserve(event)

    RESERVED_DATES[Object.keys(date)[0]] = Object.values(date)[0]
    return RESERVED_DATES
}

// ASIGNAMOS ALGUNAS FECHAS Y HORAS A LA MOCK BD
addEvent('2024/03/09 10:00')
addEvent('2024/03/09 14:10')
addEvent('2024/03/09 14:10')
addEvent('2024/03/11 15:30')
addEvent('2024/03/11 16:10')
addEvent('2024/03/09 12:00')
