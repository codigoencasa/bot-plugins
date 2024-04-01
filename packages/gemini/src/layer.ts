import "dotenv/config"
import { AnyBot, GeminiOpts } from "./types"
import { Gemini } from "./gemini"
import { HumanMessage, SystemMessage } from "@langchain/core/messages"

import { getHistory, handleHistory } from "./history"

import { UrlToBase64 } from "@builderbot-plugins/url-to-base64"
import { QA_PROMPT } from "./prompts"
import assert from "assert"
import { IMG_PROMPT } from "./prompts/IMG_PROMPT"

async function getUrl (provider: any, ctx: any, path: string = '/tmp/') {
    let url: string;
    try {
        // @ts-ignore
        url = await provider?.saveFile({ ctx: ctx.messageCtx })
        const base64 = await UrlToBase64.fromUrl(url)
        
        return base64
    } catch (error) {
        // @ts-ignore
        url = await provider?.saveFile(ctx, { path })
        const base64 = UrlToBase64.fromFilePath(url)        

        return base64
    }
}

export const geminiLayer = async (geminiOpts: Partial<GeminiOpts>, ...bot: AnyBot) => {

    const [ctx, methods] = bot[0]
    let question: HumanMessage
    
    if (Boolean(geminiOpts.vision && ctx.body.match(/event_media/gim))) {
        // @ts-ignore
        assert(methods.provider?.saveFile, 'Your provider need to implement the saveFile method, see @builderbot-plugins/telegram')

        const model = Gemini({
            modelName:  "gemini-pro-vision",
            ...geminiOpts?.extra
        })

        const data = await getUrl(methods.provider, ctx, geminiOpts?.image_path)

        question = new HumanMessage({
            content: [
                {
                    type: "text",
                    text: geminiOpts.visionPrompt || IMG_PROMPT
                },
                {
                    type: "image_url",
                    image_url: `data:${data.mimetype};base64,${data.data}`,
                }
            ]
        })

        const answer = await model.invoke([question as any])

        if (geminiOpts?.cb) {
            await methods.state.update({ answer: answer?.content as string })
            await geminiOpts.cb(ctx, methods)

            return 
        }else {
            return await methods.flowDynamic(answer?.content as string)
        }
    }

    const SYSTEM = QA_PROMPT.replaceAll('{language}', 'spanish')
        .replaceAll('{question}', ctx.body)
        .replaceAll('{context}', Object.entries(geminiOpts?.context).map(s => s.join(': ')).join('\n'))

    const model = Gemini({
        modelName:  "gemini-pro",
        ...geminiOpts?.extra
    })

    const template = new SystemMessage({
        content: SYSTEM,
        name: 'system',
    })

    question = new HumanMessage({
        content: [
            {
                type: "text",
                text: ctx.body
            },
        ]
    })

    const history = await getHistory(methods.state)
    history.push(question)

    const messages = [template].concat(history)
    const answer = await model.invoke(messages as any)
    await handleHistory([question, answer], methods.state)

    if (geminiOpts?.cb) {
        await methods.state.update({ answer: answer?.content as string })
        await geminiOpts.cb(ctx, methods)

        return 
    }else {
        return await methods.flowDynamic(answer?.content as string)
    }

    
}