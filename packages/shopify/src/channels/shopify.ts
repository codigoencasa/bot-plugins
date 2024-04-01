
import axios from "axios"

import { Channel } from "./respository"
import { Products, ShopDetail } from "../types"
import { cleanHtml } from "../utils/cleanHtml"
import { ClassManager } from "../ioc"


/**
 * implementamos la interface para que asegurarnos de tener los metodos necesarios
 */
class Shopify implements Channel {
    private readonly version = '2024-01'
    private apiKey: string
    private domain: string

    constructor(_apiKey: string, _domain: string) {
        this.apiKey = _apiKey
        this.domain = _domain
    }

    /**
     * Builder URL endpoint
     * @returns 
     */

    /** NOMAS SE VE MAS CLARO COMO UN GET JEJE */
    private get buildUrl() {
        const url = `https://${this.domain}/admin/api/${this.version}`
        return url
    }

    /**
     * Obtener informacion de la Tienda
     * @returns 
     */
    async getStoreInfo(): Promise<string> {

        try {
            const url = `${this.buildUrl}/shop.json`
            const store = ClassManager.hub().get('storeInformation')

            let info: string;
            
            if (!store) {
                const { data } = await axios.get<{ shop: ShopDetail }>(url, {
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Shopify-Access-Token': this.apiKey,
                    }
                })
    
                info = [
                    `Name: ${data.shop.name}`,
                    `Email: ${data.shop.email}`,
                    `City: ${data.shop.city}`,
                    `Address: ${data.shop.zip}, ${data.shop.city}`,
                    `Domain: ${data.shop.domain}`,
                    `Currency: ${data.shop.currency}`,
                    `Claims and complaints: For claims, complaints, 
                        and refunds, please leave us an email at the following address ${data.shop.email}`
                ].join('\n')
            }else {
                info = Object.entries(store).map(s => s.join(': ')).join('\n')
            }

            return info

        } catch (error) {
            console.log(`Error`, error)
        }
    }

    /**
     * Obtener productos de la tienda
     * @returns 
     */
    async getProducts(): Promise<{ id: string; item: string; }[]> {

        try {
            const documents: { id: string; item: string; }[] = []
            const url = `${this.buildUrl}/products.json`
            const { data } = await axios.get<{ products: Products[] }>(url, {
                headers: {
                    'Content-Type': 'application/json',
                    'X-Shopify-Access-Token': this.apiKey,
                }
            })

            for (const product of data?.products) {

                //TODO falta agregar el link donde se paga o el detalle del producto
                //TODO tenemos que asegurarnos que si alguna propiedad es undefined o null hacer que coloque como "n/a"
                documents.push({
                    item: `
                    name: ${cleanHtml(product.title)}
                    description: ${cleanHtml(product.body_html)}
                    prices: ${product.variants.map(v => v.price).join(', ')}
                    product_detail: https://${this.domain}/products/${product.handle} 
                    image_url: ${product.images.length ? product.images[0].src : null}
                    status: ${product?.status}
                    type: ${product.product_type ?? null}
                    vendor: ${cleanHtml(product.vendor)}
                `,
                    id: String(product?.id) 
                })
            }

            return documents

        } catch (error) {
            console.log(`Error`, error)
        }
    }

}

export { Shopify };