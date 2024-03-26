import { GlobalVendorArgs } from "@builderbot/bot/dist/types"

export type WaliArgs = GlobalVendorArgs & { token: string, deviceId: string }


export type WaliMessage = {
    data: {
        type: 'image' | 'text' | 'video' | 'audio' | 'document' | 'location'
        toNumber: string
        from: string
        fromNumber: string
        body?: string
        location?: {
            latitude: number,
            longitude: number
            name: string
            address: string
        }
        meta: {
            notifyName: string
        }
    }
}