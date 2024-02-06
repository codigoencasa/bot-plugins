import { AddonConfig } from "./types";

import { ShopifyRunnable } from "./runnable";
import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";

class Shopify {
    private model: ChatOpenAI
    private embeddings: OpenAIEmbeddings

    constructor(
        public addonConfig?: AddonConfig
    ) {

        this.model = new ChatOpenAI({
            openAIApiKey: this.addonConfig.openAIApiKey,
        })

        this.embeddings = new OpenAIEmbeddings({
            openAIApiKey: this.addonConfig.openAIApiKey
        })

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
            let runnable = new ShopifyRunnable(this.embeddings, this.model, this.addonConfig.shopifyApyKey, this.addonConfig.shopifyCookie)
            console.info('[RUNNABLE]: RUNNABLE CREATED')
            
            if (!runnable.runnable) {
                console.info('[RUNNABLE]: Building RAG')
                runnable = await runnable.buildRunnable()
            }

            console.info('[RUNNABLE]: GET ANSWER')
            const answer = await runnable.invoke(question, chat_history)

            if (typeof answer !== 'string') return answer?.content
            return answer
    
    }

}

export { Shopify };