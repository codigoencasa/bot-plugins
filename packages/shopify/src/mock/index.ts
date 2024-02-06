import axios from "axios"
import { Products } from "../types";


const getData = async (apiKey: string, cookie: string) => {

let config = {
  method: 'get',
  maxBodyLength: Infinity,
  url: 'https://electonicos-2025.myshopify.com/admin/api/2024-01/products.json',
  headers: { 
    'Content-Type': 'application/json', 
    'X-Shopify-Access-Token': apiKey, 
    'Cookie': cookie
  }
};
    const {data} = await axios.request(config)
    
    return data?.products as Products[]

}

export { getData }