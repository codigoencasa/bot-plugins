import { Settings } from "../../types"

export const builderArgs = (opts?: Settings | undefined): {
    modelName: string
    openApiKey: string,
    shopifyApiKey: string,
    shopifyDomain: string
} => {

    const modelName = opts?.modelName ?? 'gpt-3.5-turbo-16k'
    const openApiKey = opts?.openApiKey ?? process.env.OPENAI_API_KEY ?? undefined
    const shopifyApiKey = opts?.shopifyApiKey ?? process.env.SHOPIFY_API_KEY ?? undefined
    const shopifyDomain = opts?.shopifyDomain ?? process.env.SHOPIFY_DOMAIN ?? undefined

    if (!shopifyApiKey) {
        throw new Error(`shopifyApiKey - enviroment [SHOPIFY_API_KEY] not found`)
    }
    if (!openApiKey) {
        throw new Error(`openApiKey - enviroment [OPENAI_API_KEY] not found`)
    }
    if (!shopifyDomain) {
        throw new Error(`shopifyDomain - enviroment [SHOPIFY_DOMAIN] not found`)
    }
    return {
        modelName,
        openApiKey,
        shopifyApiKey,
        shopifyDomain
    }
}
