import { format, setDefaultOptions, addMinutes, differenceInMinutes, subMinutes } from "date-fns";

setDefaultOptions({
    weekStartsOn: 1
})

const formatDate = (date: Date) => {
    const dateToFormat = new Date(date).toLocaleString();
    
    const formatDate = format(dateToFormat, 'yyyy/MM/dd HH:mm'); // Formato "dd/MM/yyyy HH:mm:ss"
    return formatDate
}

export const endDate = (date: any) => {
    return formatDate(addMinutes(date, 45));
}

export const createReserve = (event: any) => {
    const startDate = formatDate(event);
    const endDate = formatDate(addMinutes(startDate, 45));
    const startThreshold = formatDate(subMinutes(startDate, 25));
    const day = format(startDate, 'EEEE'); // Obtener el día de la semana

    return {
        [startDate]: [
            `Calendario Reservado ${startDate}; Sin disponibilidad desde: ${startThreshold}`,
            `Hasta: ${endDate}`,
            `Dia: ${day}`
        ].join(' ')
    }
}

export const isDateReserved = (date: any, dates: any) => {
    const keys = Object.keys(dates)
    
    if (keys.filter(key => key.includes(date.split(' ')[0])).some(key => {
        const threshold = Math.abs(differenceInMinutes(key, date))
        console.log(key, threshold, threshold <= 45)
        return  threshold <= 45
    })) return true
    return false
}