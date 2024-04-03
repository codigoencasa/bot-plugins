import { FastEmbedding } from "@builderbot-plugins/fast-embedding";
import { LanceDB } from "@langchain/community/vectorstores/lancedb";
import { Table, connect } from "vectordb";
import { loadFile } from "../loaders";
import { Document } from "@langchain/core/documents";


export default class StoreManager {

    static async init(path?: string) {
        const tableName = 'data'
        const embeddingInstance = new FastEmbedding('AllMiniLML6V2')

        const db = await connect(`./${tableName}.db`);
        let table: Table
        let vectorStore: LanceDB

        try {
            table = await db.openTable(tableName);

            vectorStore = new LanceDB(embeddingInstance, {
                table
            })
        } catch (_) {
            table = await db.createTable(tableName,
                [{ vector: Array(await embeddingInstance.getDimension()), text: "foo", id: 0 }]);

            const docs = await loadFile(path || './data')
            
            vectorStore = await LanceDB.fromDocuments(
                docs.map((doc, id) => new Document({
                    pageContent: doc.pageContent,
                    metadata: {
                        id
                    }
                })),
                embeddingInstance, {
                table
            })

        }

        return vectorStore.asRetriever()
    }
}