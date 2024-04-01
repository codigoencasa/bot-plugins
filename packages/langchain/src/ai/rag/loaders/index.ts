import fs from "fs"
import { CSVLoader } from "langchain/document_loaders/fs/csv";
import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
import {
  JSONLoader,
} from "langchain/document_loaders/fs/json";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { PDFLoader } from "langchain/document_loaders/fs/pdf"
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter"


export const loadFile = async (dir: string) => {
    if (!fs.existsSync(dir)) throw new Error(`[ERROR] no existe el directorio: ${dir}`)
    
    const loader = new DirectoryLoader(
        dir,
        {
          ".json": (path) => new JSONLoader(path, "/texts"),
          ".pdf": (path) => new PDFLoader(path),
          ".txt": (path) => new TextLoader(path),
          ".csv": (path) => new CSVLoader(path, "text"),
        }
      );

    return await loader.loadAndSplit(
      new RecursiveCharacterTextSplitter({
        separators: ["\n\n", "\n", "\r"]
        })
      )
} 

