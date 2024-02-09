
import { createShopifyFlow } from "../src/bot/index"

test('shopify flow return a flow', async () => {

    const flow = createShopifyFlow({
        openApiKey: "sk-",
        shopifyApiKey: "---",
        shopifyDomain: "---",
    })

    /** THIS MUST RETURN AN VALIDATION EXPECT INSTANCE OF TFlow<any, any> */
    expect(flow).toBe(true);
});