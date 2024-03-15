import type { TFlow } from "@bot-whatsapp/bot/dist/types";
import { LanceDB } from "@langchain/community/vectorstores/lancedb";
import { Embeddings } from "@langchain/core/embeddings";
import { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { VectorStoreRetriever } from "@langchain/core/vectorstores";

import { History } from "./bot/utils/handleHistory";


export type StoreRetriever = VectorStoreRetriever<LanceDB>


export type ShopDetail = {
  name: string
  email: string
  country: string
  province: string
  currency: string
  domain: string
  zip: string
  city: string
}

export type SmtartFlow = {
  name: string;
  description: string;
  flow: TFlow<any, any>
}

export type Settings = {
  openApiKey?: string
  shopifyApiKey?: string
  shopifyDomain?: string
  modelName?: string
}

export type DevSettings = {
  flows?: SmtartFlow[];
  modelInstance?: BaseChatModel;
  embeddingInstance?: Embeddings;
  language?: string;
  storeInformation?: Partial<StoreInformation> & {
    [key: string]: string|number
  }
}

type StoreInformation = {
  name: string;
  email: string;
  address: string;
  country: string;
  province: string;
  city: string;
  zip: string|number;
  currency: string;
  domain: string;
  bussiness_hours: string;
  Claims_refunds_complaints: string;
}

export type Options = {
  model: "gpt-3.5-turbo-16k" | string;
  temperature: number;
  apiKey: string;
  max_tokens: number;
  top_p: number;
  frequency_penalty: number;
  presence_penalty: number;
}

export type ConversationalRetrievalQAChainInput = {
  customer_name: string;
  question: string;
  chat_history: History[];
  language: string;
};

export interface Products {
  body_html: string
  created_at: string
  handle: string
  id: number
  images: Image[]
  options: Option
  product_type: string
  published_at: string
  published_scope: string
  status: string
  tags: string
  template_suffix: string
  title: string
  updated_at: string
  variants: Variant[]
  vendor: string
}

export interface Image {
  id: number
  product_id: number
  position: number
  created_at: string
  updated_at: string
  width: number
  height: number
  src: string
  variant_ids: VariantId[]
}

export interface VariantId { }

export interface Option {
  id: number
  product_id: number
  name: string
  position: number
  values: string[]
}

export interface Variant {
  barcode: string
  compare_at_price: any
  created_at: string
  fulfillment_service: string
  grams: number
  weight: number
  weight_unit: string
  id: number
  inventory_item_id: number
  inventory_management: string
  inventory_policy: string
  inventory_quantity: number
  option1: string
  position: number
  price: number
  product_id: number
  requires_shipping: boolean
  sku: string
  taxable: boolean
  title: string
  updated_at: string
}
