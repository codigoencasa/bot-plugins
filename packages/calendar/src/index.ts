import { MemoryDB, createBot, createFlow } from "@builderbot/bot"
import welcomeFlow from "./mocks/flows/welcome.flow"
import provider from "./mocks/provider"

/*
    EL CORE ESTA EN MOCK

    ESTA ES UNA MAQUETA O PROTOTIPO DE USO FACIL PARA GENERAR RESERVAS
    EN CUALQUIER MODALIDAD DE SERVICIO

    USA TELEGRAM COMO PROVIDER :)
*/

const main = async () => {
    await createBot({
        flow: createFlow([welcomeFlow]),
        provider,
        database: new MemoryDB()
    })
}

main()