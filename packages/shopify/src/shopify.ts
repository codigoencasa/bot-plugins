

import { ShopifyRunnable } from "./runnable";


class Shopify {
    constructor(
        private runnable: ShopifyRunnable,
    ) {
    }

    async getStoreInfo (): Promise<string> {
        return await this.getStoreInfo()
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