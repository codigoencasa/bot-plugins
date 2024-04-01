import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { ContextualCompressionRetriever } from "langchain/retrievers/contextual_compression";
import { EmbeddingsFilter } from "langchain/retrievers/document_compressors/embeddings_filter";
import { DocumentCompressorPipeline } from "langchain/retrievers/document_compressors";
// @ts-ignore
import { FastEmbedding } from "@builderbot-plugins/fast-embedding";
import StoreManager from "../store";

export default class Brain {

    static async init() {
        const embeddingsFilter = new EmbeddingsFilter({
            embeddings: new FastEmbedding('AllMiniLML6V2'),
            similarityThreshold: 0.4,
            k: 5,
        });

        const textSplitter = new RecursiveCharacterTextSplitter({
            chunkSize: 150,
            chunkOverlap: 0,
            separators: ["\n\n", "\n", "\r"],
        });

        const compressorPipeline = new DocumentCompressorPipeline({
            transformers: [textSplitter, embeddingsFilter],
        });

        const baseRetriever = await StoreManager.init() as any

        return new ContextualCompressionRetriever({
            baseCompressor: compressorPipeline,
            baseRetriever,
        });
    }
}