import { AIMessageChunk, BaseMessage, ChatMessage, ChatMessageChunk, FunctionMessageChunk, HumanMessageChunk, SystemMessageChunk, ToolMessageChunk } from "@langchain/core/messages";
import axios from "axios"

import { IMessages, IOptions } from "./types";


export function extractGenericMessageCustomRole(message: any) {
    if (message.role !== "system" &&
        message.role !== "assistant" &&
        message.role !== "user" &&
        message.role !== "function" &&
        message.role !== "tool") {
        console.warn(`Unknown message role: ${message.role}`);
    }
    return message.role;
}
export function messageToOpenAIRole(message: BaseMessage) {
    const type = message._getType();

    switch (type) {
        case "system":
            return "system";
        case "ai":
            return "assistant";
        case "human":
            return "user";
        case "function":
            return "function";
        case "tool":
            return "tool";
        case "generic": {
            if (!ChatMessage.isInstance(message))
                throw new Error("Invalid generic chat message");
            return extractGenericMessageCustomRole(message);
        }
        default:
            throw new Error(`Unknown message type: ${type}`);
    }
}

export function convertMessagesToOpenAIParams(messages: BaseMessage[]) {
    // TODO: Function messages do not support array content, fix cast
    return messages.map((message) => ({
        role: messageToOpenAIRole(message),
        content: message.content,
        name: message.name,
        function_call: message.additional_kwargs.function_call,
        tool_calls: message.additional_kwargs.tool_calls,
        // @ts-expect-error
        tool_call_id: message?.tool_call_id,
    }));
}

export function _convertDeltaToMessageChunk(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delta) {
    const role = delta.role;
    const content = delta.content ?? "";
    let additional_kwargs = {};

    if (delta.function_call) {
        additional_kwargs = {
            function_call: delta.function_call,
        };
    }
    else if (delta.tool_calls) {
        additional_kwargs = {
            tool_calls: delta.tool_calls,
        };
    }

    if (role === "user") {
        return new HumanMessageChunk({ content });
    }
    else if (role === "assistant") {
        return new AIMessageChunk({ content, additional_kwargs });
    }
    else if (role === "system") {
        return new SystemMessageChunk({ content });
    }
    else if (role === "function") {
        return new FunctionMessageChunk({
            content,
            additional_kwargs,
            name: delta.name,
        });
    }
    else if (role === "tool") {
        return new ToolMessageChunk({
            content,
            additional_kwargs,
            tool_call_id: delta.tool_call_id,
        });
    }
    else {
        return new ChatMessageChunk({ content, role });
    }
}

export async function chatCompletions(messages: IMessages[], options: IOptions) {
    const handleResponse = (obj: any) => {
        const type = typeof obj;
        if (type == "string") {
          const oldobj = obj.replace("_", "");
          const newobj = JSON.parse(oldobj);
          return newobj.gpt;
        }
        return obj?.gpt;
    }

    const url = "https://nexra.aryahcr.cc/api/chat/gpt";
    const data = {
      messages,
      prompt: options.prompt,
      model: options.model,
      markdown: false
    };
    const headers = {
      "Content-Type": "application/json"
    };
    const response = await axios.post(url, data, { headers }).then();
    try {
        
      return handleResponse(response.data);
    } catch (err) {
      return err;
    }
}