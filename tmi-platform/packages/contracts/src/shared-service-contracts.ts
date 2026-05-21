export interface WillDoItServiceContract {
  createWorkerRequest(input: {
    requesterModule: string;
    requestType: string;
    workerQuantityMode: string;
    workerCount: number;
    location: string;
    urgency: string;
  }): Promise<{ requestId: string; status: string }>;
}

export interface LawServiceContract {
  createLegalRequest(input: {
    requesterModule: string;
    requestType: string;
    urgency: string;
    context: Record<string, unknown>;
  }): Promise<{ caseId: string; status: string }>;
}

export interface ConstructionDispatchContract {
  createConstructionDispatch(input: {
    requesterModule: string;
    scope: string;
    workersRequired: number;
    certificationsRequired: string[];
    location: string;
  }): Promise<{ dispatchId: string; status: string }>;
}

export interface ContractorVerificationContract {
  verifyContractor(input: { contractorId: string; requiredLicenses: string[] }): Promise<{ approved: boolean; reasons: string[] }>;
}

export interface LegalRepresentationContract {
  openRepresentation(input: { requesterModule: string; issueType: string; details: string }): Promise<{ caseId: string; status: string }>;
}

export interface LegalIncidentContract {
  openIncidentReview(input: { requesterModule: string; incidentType: string; evidenceRef: string }): Promise<{ caseId: string; status: string }>;
}

export interface BreachResponseContract {
  startBreachResponse(input: { moduleId: string; incidentId: string; severity: string }): Promise<{ chainId: string; status: string }>;
}

export interface ModuleIsolationContract {
  isolateModule(input: { moduleId: string; reason: string }): Promise<{ isolated: boolean; timestamp: number }>;
}

export interface EmergencyQuarantineContract {
  quarantineModule(input: { moduleId: string; incidentId: string }): Promise<{ status: 'QUARANTINED' | 'EMERGENCY_LOCKED'; timestamp: number }>;
}
