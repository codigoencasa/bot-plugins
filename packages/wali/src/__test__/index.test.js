import "dotenv/config"
import { WaliProvider } from "../index"
import { createProvider } from "@builderbot/bot"

let provider;

describe('CHECK PROVIDER', () => {

    it('check provider', async () => {
        try {
            provider = createProvider(WaliProvider, {
                token: process.env.TOKEN,
                deviceId: process.env.DEVICE_ID
            })
        } catch (_) {}

        expect(provider).not.toBeNull()
    })
})