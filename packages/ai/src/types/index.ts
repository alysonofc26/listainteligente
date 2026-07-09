export type AiAction =
  | "summary"
  | "savings"
  | "expensive"
  | "budget"
  | "explain";

export interface AiContextItem {
  name: string;
  quantity: number;
  price: number | null;
  unitPrice: number | null;
  category: string | null;
  brand: string | null;
}

export interface AiContext {
  action: AiAction;
  listName: string;
  items: AiContextItem[];
  total: number;
  itemCount: number;
  budget?: number;
  supermarket?: string;
}

export interface AiProviderConfig {
  apiKey: string;
  model: string;
  maxTokens: number;
  temperature: number;
}

export interface AiUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface AiResponse {
  content: string;
  model: string;
  usage: AiUsage;
}

export interface AiProvider {
  readonly model: string;
  complete(
    systemPrompt: string,
    userPrompt: string,
  ): Promise<AiResponse>;
}
