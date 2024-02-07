import { HNSWLib } from "@langchain/community/vectorstores/hnswlib";
import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import fs from "fs"
import { RetrievalQAChain } from "langchain/chains";
import { CSVLoader } from "langchain/document_loaders/fs/csv";
import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
import {
  JSONLoader,
  JSONLinesLoader,
} from "langchain/document_loaders/fs/json";
import { TextLoader } from "langchain/document_loaders/fs/text";


export const loadFile = async (dir: string, model: ChatOpenAI) => {
    if (!fs.existsSync(dir)) throw new Error(`[ERROR] no existe el directorio: ${dir}`)
    
    const loader = new DirectoryLoader(
        dir,
        {
          ".json": (path) => new JSONLoader(path, "/texts"),
          ".jsonl": (path) => new JSONLinesLoader(path, "/html"),
          ".txt": (path) => new TextLoader(path),
          ".csv": (path) => new CSVLoader(path, "text"),
        }
      );

    const docs = await loader.load()
    const vectorStore = await HNSWLib.fromDocuments(docs, new OpenAIEmbeddings())
    vectorStore.save('./src/data/qa')
    

    // Initialize a retriever wrapper around the vector store
    const vectorStoreRetriever = vectorStore.asRetriever();
    return RetrievalQAChain.fromLLM(model, vectorStoreRetriever);
} 

