export interface NeedAChargeInventoryContract {
  requestParts(input: {
    itemSku: string;
    quantity: number;
    reason: string;
    requestedBy: string;
  }): Promise<{ accepted: boolean; requestId: string; supplierModule: "transistor-hut" }>;
}
