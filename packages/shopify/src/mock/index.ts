import axios from "axios"

import { Products } from "../types";


const getData = async (apiKey: string, domain: string, json: string = 'products.json') => {

  const config = {
    method: 'get',
    maxBodyLength: Infinity,
    url: `https://${domain}/admin/api/2024-01/${json}`,
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': apiKey,
    }
  };
  const { data } = await axios.request(config)

  return data?.products as Products[]

}

export { getData }