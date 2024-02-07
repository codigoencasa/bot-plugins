import axios from "axios"

import { Products } from "../types";


const getData = async (apiKey: string, domain: string) => {

  const config = {
    method: 'get',
    maxBodyLength: Infinity,
    url: `https://${domain}/admin/api/2024-01/products.json`,
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': apiKey,
    }
  };
  const { data } = await axios.request(config)

  return data?.products as Products[]

}

export { getData }