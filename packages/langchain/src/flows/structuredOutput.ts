import { EVENTS, addKeyword } from "@builderbot/bot";
import { Callbacks, ModelArgs, ModelName } from "../types";
import { FactoryModel, Memory } from "../ai";
import { ZodSchema, ZodType, ZodTypeDef } from "zod";
import { StructuredOutputParser } from "langchain/output_parsers";
import { TFlow } from "@builderbot/bot/dist/types";

export default class StructuredOutput {
    private static kwrd: TFlow<any, any> = addKeyword(EVENTS.ACTION)
    private static schema: ZodSchema
    private static structure: StructuredOutputParser<ZodType<any, ZodTypeDef, any>>
    private static model: FactoryModel

    static setKeyword = (ev: any) => {
        this.kwrd = addKeyword(ev, { sensitive: false })
        return this
    }

    static setZodSchema = <T>(schema: ZodType<T, ZodTypeDef, T>) => {
        this.schema = schema
        this.structure = new StructuredOutputParser(schema)
        return this
    }

    static setAIModel = (ai: { modelName: ModelName, args?: ModelArgs }) => {
        this.model = new FactoryModel(ai)
        return this
    }

    static create = (callbacks?: Callbacks) => {
        if (!this.schema) {
            throw new Error('You must set the zod schema method first')
        }

        if (!this.model) {
            this.model = new FactoryModel()
        }

        this.kwrd = callbacks?.beforeStart && callbacks?.beforeStart(this.kwrd) || this.kwrd

        this.kwrd = this.kwrd.addAction(async (ctx, { state }) => {
            try {
                const responseSchema = await this.model.createStructure({
                    question: ctx.body,
                    history: await Memory.getMemory(state, 4),
                    format_instructions: this.structure.getFormatInstructions()
                }, this.schema)

                Memory.memory({ user: ctx.body, assistant: JSON.stringify(responseSchema) }, state)

                await state.update({ schema: responseSchema })
            } catch (error) {
                callbacks?.onFailure && callbacks?.onFailure(error)
                await state.update({ schema: null })
            }

        })
        this.kwrd = callbacks?.afterEnd && callbacks?.afterEnd(this.kwrd) || this.kwrd
        return this.kwrd
    }
}