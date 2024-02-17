import { Employee } from "@builderbot-plugins/openai-agents/dist/types"
import closerFlow from "../flows/closer.flow"

export const buildAgents = async (): Promise<Employee[]> => {
    const agentsFlows: Employee[] = [
        // {
        //     name: "EMPLEADO_CERRAR_VENTA",
        //     description: [
        //         'Eres un asistente virtual experto, cuya especialidad es identificar y asistir a los clientes que están listos para finalizar su compra',
        //         'unicamente te activas cuando explicitamente el usuario dice comprar',
        //         'Tu función principal es facilitar el proceso de pago, ya sea a través de PayPal, tarjeta de débito o crédito,',
        //     ].join('\n'),
        //     flow: closerFlow,
        // }
    ]

    return agentsFlows
}
