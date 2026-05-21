export interface ConstructionDispatchContract {
  createConstructionDispatch(input: {
    requesterModule: string;
    scope: string;
    workerTypes: string[];
    workerCount: number;
    certificationsRequired: string[];
    permitsRequired: boolean;
    inspectionRequired: boolean;
    location: string;
    urgency: 'normal' | 'high' | 'emergency';
  }): Promise<{ dispatchId: string; status: string }>;
}

export interface ContractorVerificationContract {
  verifyContractor(input: {
    contractorId: string;
    requiredLicenses: string[];
    requiredInsurance: string[];
  }): Promise<{ approved: boolean; reasons: string[] }>;
}
