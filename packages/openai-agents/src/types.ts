import { TFlow } from "@builderbot/bot/dist/types";

export type Employee = {
  name: string;
  description: string;
  flow?: TFlow<any, any>
}

export type Setting = {
  model: 'gpt-3.5-turbo' | string,
  temperature: number,
  apiKey: string
}