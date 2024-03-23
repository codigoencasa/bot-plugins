import { EmbeddingModel, FlagEmbedding } from "fastembed";

// For CommonJS
// const { EmbeddingModel, FlagEmbedding } = require("fastembed)

export class FastEmbedding {
    private model: EmbeddingModel
    private cacheDir = './cache_embedding'

    constructor(private type: keyof typeof EmbeddingModel) {
        this.model = EmbeddingModel[this.type]
    }

    getInstance() {
        return this.model
    }

    async getDimension() {
        return (await this.embedQuery('foo')).length
    }

    embedDocuments = async (documents: any[], batchSize = 10) => {
        const embeddingModel =  await FlagEmbedding.init({
            model: this.model,
            cacheDir: this.cacheDir,
        });

        const batchs = embeddingModel.embed(documents, batchSize); //Optional batch size. Defaults to 256
        const embeddingsArray = []
    
        for await (const batch of batchs) {
            // batch is list of Float32 embeddings(number[][])
            embeddingsArray.push(batch.map(b => Array.from(b)))
        }
    
    
        // console.log(await embedDocuments(['hello', 'world'], 10))
        return embeddingsArray[0]
        
    }
    
    embedQuery = async (query: string) => {
        const embeddingModel = await FlagEmbedding.init({
            model: this.model,
            cacheDir: this.cacheDir,
        });

        const embeddingsArray = await embeddingModel.queryEmbed(query);
        // console.log(await embedQuery('hola'))
        return Array.from(embeddingsArray)
    }
    
    
}