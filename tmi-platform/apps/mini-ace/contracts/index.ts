/** Inter-module contract for Mini Ace. */
export interface ServiceAdapter {
  getStatus(): Promise<{ moduleId: string; state: string; timestamp: number }>;
}
