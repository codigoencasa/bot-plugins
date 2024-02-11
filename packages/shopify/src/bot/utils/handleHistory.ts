import { BotState } from "@bot-whatsapp/bot/dist/types"

export type History = { role: 'user' | 'seller', content: string }

const handleHistory = async (inside: History, _state: BotState) => {
    const history = _state.get<History[]>('history') ?? []
    history.push(inside)
    await _state.update({ history })
}

const getHistory = (_state: BotState, k = 5) => {
    const history = _state.get<History[]>('history') ?? []
    const limitHistory = history.reverse().slice(-k).reverse()

    console.log(`[history]:`, limitHistory)

    return history
}

export { handleHistory, getHistory }