
import { HumanMessage, SystemMessage } from "@langchain/core/messages"

export type History = [HumanMessage, SystemMessage]

const handleHistory = async (inside: History, _state: any) => {
    const history = _state.get('history') as History[] ?? []
    history.push(inside)
    await _state.update({ history })
}

const getHistory = async (_state: any, k = 4) => {
    const history = _state.get('history') as History[] ?? []
    const limitHistory = history.slice(-k)

    await _state.update({ history: limitHistory })
    return limitHistory.flat()
}

const clearHistory = async (_state: any) => {
    _state['history'].clear()
}


export { handleHistory, getHistory, clearHistory }