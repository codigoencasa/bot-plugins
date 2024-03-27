
import { EventEmitterClass, utils } from "@builderbot/bot";
import type { ProviderEventTypes } from "@builderbot/bot/dist/types";
import { WaliMessage } from "./types";
export class WaliEvents extends EventEmitterClass<ProviderEventTypes> {

    /**
     * Función que maneja el evento de mensaje entrante de Wali.
     * @param payload - El mensaje entrante de Wali.
     */
    public eventInMsg = (payload: WaliMessage) => {

        if (payload.data?.from.includes('g.us') || !payload.data) return

        const sendObj = {
            ...payload,
            body: payload.data?.body || '',
            from: payload.data.fromNumber,
            name: payload.data.meta.notifyName,
            host: {
                phone: payload.data.toNumber
            },
        }
        if (['image', 'video'].includes(payload.data.type)) sendObj.body = utils.generateRefProvider('_event_media_')
        if (payload.data.type === 'document') sendObj.body = utils.generateRefProvider('_event_document_')
        if (payload.data.type === 'audio') sendObj.body = utils.generateRefProvider('_event_voice_note_')
        if (payload.data.type === 'location') sendObj.body = utils.generateRefProvider('_event_location_')

        this.emit('message', sendObj)
    }

}
