/** Inter-module contract for USA Stream Team. */
export interface ServiceAdapter {
  getStatus(): Promise<{ moduleId: string; state: string; timestamp: number }>;
}
