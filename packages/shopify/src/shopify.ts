

import { ShopifyRunnable } from "./runnable";


class Shopify {
    constructor(
        private runnable: ShopifyRunnable,
    ) {
    }

    async getStoreInfo (): Promise<string> {
        const shop = await this.runnable.getInfoStore()

        console.log('shop', shop)

        return [
            `Email: ${shop.customer_email}`,
            `City: ${shop.city}`,
            `Address: ${shop.address1} ${shop.address2}`,
            `Domain: ${shop.myshopify_domain}`,
            `Name Owner: ${shop.name}`,
            `Shop Owner: ${shop.shop_owner}`,
            `Province: ${shop.province}`
        ].join(' ')
    }

    async invoke(
        question: string,
        chat_history?: [string, string][]
    ): Promise<string> {
        console.info('[RUNNABLE]: CREATING RUNNABLE')
        console.info('[RUNNABLE]: RUNNABLE CREATED')

        if (!this.runnable.runnable) {
            console.info('[RUNNABLE]: Building RAG')
            this.runnable.runnable = await this.runnable.buildRunnable()
        }

        console.info('[RUNNABLE]: GET ANSWER')
        const answer = await this.runnable.invoke(question, chat_history)

        if (typeof answer !== 'string') return answer?.content
        return answer

    }

}

export { Shopify };