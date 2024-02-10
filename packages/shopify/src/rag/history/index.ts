import { LanceDB } from "@langchain/community/vectorstores/lancedb";
import { Table, connect } from "vectordb";
import { ClassManager } from "../../ioc";
import { Embeddings } from "@langchain/core/embeddings";

const history = async () => {
  const db = await connect("./history.db");
  let table: Table

  try {
    table = await db.openTable('history');
  } catch (error) {
    table = await db.createTable("history", [
        { vector: Array(1536), text: "sample" },
    ]);
  }

  const embeddingInstance = ClassManager.hub().get<Embeddings>('embeddingInstance')

  // [
  //   Document {
  //     pageContent: 'Foo\nBar\nBaz\n\n',
  //     metadata: { source: 'src/document_loaders/example_data/example.txt' }
  //   }
  // ]
  return new LanceDB(embeddingInstance, {
    table: table
  }).asRetriever()
};

export const save_history = async (chat_id: string|number, hst: [string, string]) => {
    
    const store = await history()

    const docs = [
        {
            pageContent: `chat_id: ${chat_id}\n\nUser: ${hst[0]}\nAssistant: ${hst[1]}`,
            metadata: {
                chat_id: String(chat_id),
                questionUser: String(hst[0]),
                answerByAssistant: String(hst[1])
            }
        }
    ]

    console.log('save hst', docs)
    await store.addDocuments(docs)
}

export const load_history = async (chat_id: string): Promise<any> => {
    
    const store = await history()
    
    const hst =  await store.vectorStore.similaritySearch(`chat_id: ${chat_id}`, 3)
    
    if (!hst.length) return [];

    return hst.map((h) => [
        h.pageContent.split(/(user:|\n\n|\n)/gim).filter(Boolean).at(3), 
        h.pageContent.split(/(assistant:|\n\n|\n)/gim).filter(Boolean).at(5)
        ]).filter(h => h.every(Boolean))
}

