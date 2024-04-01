import { EVENTS, addKeyword } from "@builderbot/bot";
import { Callbacks, ModelArgs, ModelName } from "../types";
import { FactoryModel, Memory, catchIntention, formatInstructionRouting } from "../ai";
import { TFlow } from "@builderbot/bot/dist/types";

export default class FlowRouting {
    private static kwrd: TFlow<any, any> = addKeyword(EVENTS.ACTION)
    private static model: FactoryModel
    private static intentions: {
        intentions: string[],
        description?: string
    }

    static setKeyword = (ev: any) => {
        this.kwrd = addKeyword(ev, { sensitive: false })
        return this
    }

    static setIntentions = (intentions: {
        intentions: string[],
        description?: string
    }) => {
        this.intentions = intentions
        return this
    }

    static setAIModel = (ai: { modelName: ModelName, args?: ModelArgs }) => {
        this.model = new FactoryModel(ai)
        return this
    }

    static create = (callbacks?: Callbacks) => {

        if (!this.intentions) {
            throw new Error('You must set the intentions method first')
        }

        if (!this.model) {
            this.model = new FactoryModel()
        }

        this.kwrd = callbacks?.beforeStart && callbacks?.beforeStart(this.kwrd) || this.kwrd

        this.kwrd = this.kwrd.addAction(async (ctx, { state }) => {
            try {
                const { intention } = await this.model.createStructure({
                    question: ctx.body,
                    history: await Memory.getMemory(state, 4),
                    format_instructions: formatInstructionRouting(this.intentions.intentions, this.intentions.description)
                }, catchIntention(this.intentions.intentions, this.intentions?.description))

                Memory.memory({ user: ctx.body, assistant: JSON.stringify(intention) }, state)
                
                await state.update({ intention })
            } catch (error) {
                callbacks?.onFailure && callbacks?.onFailure(error)
                await state.update({ intention: null })
            }

        })
        this.kwrd = callbacks?.afterEnd && callbacks?.afterEnd(this.kwrd) || this.kwrd
        return this.kwrd
    }
}