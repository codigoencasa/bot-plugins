import { Employee } from "@builderbot-plugins/openai-agents/dist/types"
import infoFlow from "../flows/info.flow"


export const buildAgents = async (): Promise<Employee[]> => {
    const agentsFlows: Employee[] = [
        {
            name: "EMPLEADO_GENERAL",
            description: [
                'Eres un asistente virtual experto, cuya especialidad es responder dudas sobre el negocio',
                'dudas como ubicacion, direccion, reembolso y temas que tengan que ver con el negocio'
            ].join('\n'),
            flow: infoFlow,
        }
    ]

    return agentsFlows
}
