import "dotenv/config"
import { AnyBot, GeminiOpts } from "./types"
import { Gemini } from "./gemini"
import { HumanMessage, SystemMessage } from "@langchain/core/messages"

import { getHistory, handleHistory } from "./history"

import { UrlToBase64 } from "@builderbot-plugins/url-to-base64"
import { QA_PROMPT } from "./prompts"
import assert from "assert"
import { IMG_PROMPT } from "./prompts/IMG_PROMPT"

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

        // @ts-ignore
        const url = await methods.provider?.saveFile({ ctx: ctx.messageCtx })

        const { mimetype, data } = await UrlToBase64.fromUrl(url)

        question = new HumanMessage({
            content: [
                {
                    type: "text",
                    text: geminiOpts.visionPrompt || IMG_PROMPT
                },
                {
                    type: "image_url",
                    image_url: `data:${mimetype};base64,${data}`,
                }
            ]
        })

        const answer = await model.invoke([question])

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
    const answer = await model.invoke(messages)
    await handleHistory([question, answer], methods.state)

    if (geminiOpts?.cb) {
        await methods.state.update({ answer: answer?.content as string })
        await geminiOpts.cb(ctx, methods)

        return 
    }else {
        return await methods.flowDynamic(answer?.content as string)
    }

    
}