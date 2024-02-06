import { Setting } from "./types"

class OpenAiClass {
    requestOptions: any = {}
    constructor(private openAiOptions: Setting = { model: 'gpt-3.5-turbo-0301', temperature: 0, apiKey: '' }) {
        if (!this.openAiOptions?.apiKey) {
            throw new Error('apiKey no pude ser vacio')
        }

        this.requestOptions = {
            method: 'POST',
            headers: this.buildHeader(),
            body: null,
            redirect: 'follow',
        }
    }

    /**
     *
     * @returns
     */
    buildHeader = () => {
        const headers = new Headers()
        headers.append('Content-Type', 'application/json')
        headers.append('Authorization', `Bearer ${this.openAiOptions.apiKey}`)
        return headers
    }

    /**
     *
     * @param {*} input
     */
    sendEmbedding = async (input: any, model = 'text-embedding-ada-002') => {
        const raw = JSON.stringify({
            input,
            model,
        })

        this.requestOptions.body = raw

        const response = await fetch('https://api.openai.com/v1/embeddings', this.requestOptions)
        return response.json()
    }

    /**
     *
     * @param {*} messages
     * @returns
     */
    sendChat = async (messages: any[] = []) => {
        const raw = JSON.stringify({
            model: this.openAiOptions.model,
            temperature: this.openAiOptions.temperature,
            messages,
        })

        this.requestOptions.body = raw

        const response = await fetch('https://api.openai.com/v1/chat/completions', this.requestOptions)
        return response.json()
    }
    /**
     *
     * @param {*} prompt
     * @returns
     */
    sendCompletions = async (prompt: string = undefined) => {
        const raw = JSON.stringify({
            model: this.openAiOptions.model,
            temperature: this.openAiOptions.temperature,
            prompt
        })

        this.requestOptions.body = raw

        const response = await fetch('https://api.openai.com/v1/completions', this.requestOptions)
        return response.json()
    }
}

export default OpenAiClass
