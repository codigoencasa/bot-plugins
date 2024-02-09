

class Shopify {
    constructor(
    ) {
    }

    async getStoreInfo(): Promise<string> {
        /** return info store from the shop */
        const info = [
            `Email:`,
            `City: `,
            `Address: `,
            `Domain:`,
            `Name Owner: `,
            `Shop Owner:`,
            `Province:`
        ].join('\n')

        console.log(``)
        console.log(`[Informacion de la tienda]:`, info)
        console.log(``)

        return info
    }

}

export { Shopify };