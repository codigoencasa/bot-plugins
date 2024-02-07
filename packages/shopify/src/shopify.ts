
import { ShopifyRunnable } from "./runnable";
import { AddonConfig } from "./types";


class Shopify {
    constructor(
        private runnable: ShopifyRunnable,
        public addonConfig?: AddonConfig,
    ) {

        this.addonConfig ||= {
            model: "gpt-3.5-turbo-16k",
            temperature: 0,
            openAIApiKey: this.addonConfig.openAIApiKey,
            shopifyApyKey: this.addonConfig.shopifyApyKey,
            shopifyCookie: this.addonConfig.shopifyCookie
        }

    }

    async invoke(
        question: string,
        chat_history?: [string, string][]
    ): Promise<string> {
        console.info('[RUNNABLE]: CREATING RUNNABLE')
        console.info('[RUNNABLE]: RUNNABLE CREATED')

        if (!this.runnable.runnable) {
            console.info('[RUNNABLE]: Building RAG')
            this.runnable = await this.runnable.buildRunnable()
        }

        console.info('[RUNNABLE]: GET ANSWER')
        const answer = await this.runnable.invoke(question, chat_history)

        if (typeof answer !== 'string') return answer?.content
        return answer

    }

}

export { Shopify };