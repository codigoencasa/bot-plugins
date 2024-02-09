import axios from "axios"

const getData = async <T>(apiKey: string, domain: string, json: string): Promise<T> => {
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
  return data
}

export { getData }