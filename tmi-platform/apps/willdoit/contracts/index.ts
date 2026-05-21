/** Inter-module contract for WillDoIt. */
export interface ServiceAdapter {
  getStatus(): Promise<{ moduleId: string; state: string; timestamp: number }>;
}
