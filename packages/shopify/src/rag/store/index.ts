import { LanceDB } from "@langchain/community/vectorstores/lancedb";
import { Document } from "@langchain/core/documents";
import { Embeddings } from "@langchain/core/embeddings";
import { Table, connect } from "vectordb";

import { Channel } from "../../channels/respository";
import { ClassManager } from "../../ioc";


export const storeManager = async (channel: Channel) => {
  const tableName = 'data'
  const embeddingInstance = ClassManager.hub().get<Embeddings>('embeddingInstance')

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
      [{ vector: Array(1536), text: "foo",  id: 0 }]);

    const products = await channel.getProducts()

    vectorStore = await LanceDB.fromDocuments(
      products.map(product => new Document({
        pageContent: product.item,
        metadata: {
          id: product.id
        }
      })), 
      embeddingInstance, {
      table
    })

  }

  return vectorStore

};