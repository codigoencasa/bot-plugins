import { persistToFile, restoreFromFile } from '@orama/plugin-data-persistence/server'


export const persist = async (db, file) => {
    return await persistToFile(db, 'binary', file)
}


export const restore = async (file) => {
    return restoreFromFile('binary',file)
}