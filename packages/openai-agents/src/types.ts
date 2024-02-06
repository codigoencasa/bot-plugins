import { TFlow } from "@bot-whatsapp/bot/dist/types";

export type Employee = {
    name: string;
    description: string;
    flow: TFlow<any, any>
  }
  
export type Setting = { 
    model: 'gpt-3.5-turbo-0301'|string, 
    temperature: number, 
    apiKey: string
 }