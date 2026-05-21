export interface TransistorHutServiceContract {
  getCatalog(): Promise<{ id: string; name: string; stock: number }[]>;
  reservePart(input: { sku: string; quantity: number; requestSource: string }): Promise<{ accepted: boolean; remaining: number }>;
  requestRestock(input: { sku: string; quantity: number; reason: string }): Promise<{ accepted: boolean; requestId: string }>;
}
