import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { ContextualCompressionRetriever } from "langchain/retrievers/contextual_compression";
import { EmbeddingsFilter } from "langchain/retrievers/document_compressors/embeddings_filter";
import { DocumentCompressorPipeline } from "langchain/retrievers/document_compressors";
import { FastEmbedding } from "@builderbot-plugins/fast-embedding";
import StoreManager from "../store";
import { ContextOpts } from "../../../types";

export default class Brain {

    static async init(opts?: Partial<ContextOpts>) {
        const embeddingsFilter = new EmbeddingsFilter({
            embeddings: new FastEmbedding('AllMiniLML6V2'),
            similarityThreshold: opts?.similarityThreshold || 0.4,
            k: opts?.k || 10,
        });

        const textSplitter = new RecursiveCharacterTextSplitter({
            chunkSize: 1000,
        });

        const compressorPipeline = new DocumentCompressorPipeline({
            transformers: [textSplitter, embeddingsFilter],
        });

        const baseRetriever = await StoreManager.init(opts?.path) as any

        return new ContextualCompressionRetriever({
            baseCompressor: compressorPipeline,
            baseRetriever,
        });
    }
}