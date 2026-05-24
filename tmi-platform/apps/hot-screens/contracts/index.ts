/** Inter-module contract for HotScreens. */
export interface ServiceAdapter {
  getStatus(): Promise<{ moduleId: string; state: string; timestamp: number }>;
}
