export * from "./qaPrompt.prompt"

export const SYSTEM_STRUCT = `Basado en el historial de conversación: 
{history}

if you don't know the answer, just only return null.

Answer the users question as best as possible.
    {format_instructions}`

export const SYSTEM_STRUCT_TEMPLATE = `Basado en el historial de conversación: 
{history}

if you don't know the answer, just only return null.

Answer the users question as best as possible.
    {format_instructions}`