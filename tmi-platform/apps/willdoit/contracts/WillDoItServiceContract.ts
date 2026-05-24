export type WorkerQuantityMode =
  | 'SINGLE_WORKER'
  | 'DUAL_WORKERS'
  | 'SMALL_CREW'
  | 'FULL_CREW'
  | 'SPECIALIST_TEAM'
  | 'EMERGENCY_TEAM';

export interface WillDoItServiceContract {
  createWorkerRequest(input: {
    requesterModule: string;
    requesterPerson: string;
    requestType: string;
    personalOrBusiness: 'personal' | 'business';
    workerQuantityMode: WorkerQuantityMode;
    workerTypes: string[];
    workerCount: number;
    location: string;
    urgency: 'low' | 'normal' | 'high' | 'emergency';
  }): Promise<{ requestId: string; status: string }>;
}
