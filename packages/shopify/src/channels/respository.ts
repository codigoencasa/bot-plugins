
export interface Channel {
    getStoreInfo(): Promise<string>
    getProducts(): Promise<{ id: string, item: string }[]>
}