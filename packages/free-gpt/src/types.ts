
export type OptionsModel = 'GPT-4'
    | 'GPT-4 Turbo'
    | 'gpt-4-0125-preview'
    | 'gpt-4-turbo-preview'
    | 'gpt-4-1106-preview'
    | 'gpt-4'
    | 'gpt-4-0613'
    | 'gpt-4-32k'
    | 'gpt-4-32k-0613'
    | 'GPT-3.5'
    | 'GPT-3.5 Turbo'
    | 'gpt-3.5-turbo-0125'
    | 'gpt-3.5-turbo'
    | 'gpt-3.5-turbo-1106'
    | 'gpt-3.5-turbo-instruct'

export type IMessages = {
    role: string;
    content: string;
}
    
export type IOptions  = {
    model: string;
    prompt: string;
}
    