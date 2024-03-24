
import { AnyOrama, count, create, insertMultiple, search } from '@orama/orama'
import { FastEmbedding } from '@builderbot-plugins/fast-embedding';
import { persist, restore } from './persists';

import fs from "fs"
import assert from 'assert';

type Schema<T> = {
    [K in keyof T]: "string" | "number" | "boolean" | "enum" | "geopoint" |  "string[]" | "number[]" | "boolean[]" | "enum[]"
}

type InferSchema<T> = {
    [K in keyof T]: T[K]
}

type Embedding = {
    embedQuery: (q: string) => Promise<number[]>
    embedDocuments: (doc: any) => Promise<number[]>
}

type Hit<T> = { id: string, score: number, document: InferSchema<T> }

export class Store<T> {
    db: AnyOrama;
    file = 'bd.bin';
    opts = {
        schema: undefined,
        recreate: false,
        batchSize: 100
    }

    constructor(opts?: {
        schema: Schema<T>;
        recreate?: boolean;
        batchSize?: number;
    }, private embeddingModel?: Embedding) { 
        this.opts = {
            ...this.opts,
            ...opts
        }
    }

    init = async (docs?: InferSchema<T>[]) => {
        this.embeddingModel ||= new FastEmbedding('AllMiniLML6V2')

        if (this.opts.recreate && fs.existsSync(this.file)) {
            fs.unlinkSync(this.file)
        }

        try {
            this.db = await restore(this.file)
        } catch (error) {
            assert(docs.length, 'No documents provided')
            const length = (await this.embeddingModel.embedQuery('foo')).length
            this.opts.schema.embedding = `vector[${length}]`
            this.db = await create({
                schema: this.opts.schema,
            })

            await insertMultiple(this.db, [...docs] as any, this.opts.batchSize, undefined, true)
            await persist(this.db, this.file)
        }


        if (!this.embeddingModel.embedDocuments || !this.embeddingModel.embedQuery) {
            throw new Error('Embedding model not supported')
        }
        return this.db
    }


    search = async (term: string, limit: number = 20, hooks?: {
        payAtention: string[]
    }, where?: any): Promise<Hit<T>[]> => {
        const { hits } = await search(this.db, {
            mode: 'hybrid',
            term,
            properties: (hooks && hooks?.payAtention.length) ? hooks.payAtention : "*",
            vector: {
                value: await this.embeddingModel.embedQuery(term),
                property: 'embedding',
            },
            similarity: 0.55,      // Minimum vector search similarity. Defaults to `0.8`
            includeVectors: true,  // Defaults to `false`
            limit,
            hybridWeights: {
                text: .1,
                vector: .9
            },
            threshold: 0.2,
            boost: {
                nombre_de_producto: 7
            },
            where
        })

        return hits as unknown as Hit<T>[]
    }


    scroll = async (): Promise<Hit<T>[]> => {
        const limit = await count(this.db)
        const { hits } = await search(this.db, {
            mode: 'hybrid',
            term: '*',
            properties: "*",
            similarity: 0,
            hybridWeights: {
                text: .1,
                vector: .9
            },
            threshold: 0.1,
            boost: {
                nombre_de_producto: 7
            },
            vector: {
                value: await this.embeddingModel.embedQuery('*'),
                property: 'embedding',
            },
            includeVectors: false,  // Defaults to `false`
            limit

        })

        return hits as unknown as Hit<T>[]
    }

    searchByLocation = async (term: string, limit: number = 18, location: { lat: number, lon: number }) => {
        const hits = await this.search(term, limit, null, {
            location: {          
                radius: {          
                    coordinates: location,
                    unit: 'm',        
                    value: 2000,      
                    inside: true
                }
            }
        })

        return hits
    }

    upsert = async (docs: InferSchema<T>[]) => {
        try {
            await insertMultiple(this.db, [ ...docs] as any, this.opts.batchSize, undefined, true)
            await persist(this.db, this.file)

            return true
        } catch (error) {
            return false
        }
    }
}
