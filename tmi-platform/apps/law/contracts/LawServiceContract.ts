export interface LegalRepresentationContract {
  openRepresentation(input: {
    requesterModule: string;
    requestType: string;
    urgency: 'low' | 'normal' | 'high' | 'emergency';
    details: string;
  }): Promise<{ caseId: string; status: string }>;
}

export interface LegalIncidentContract {
  openIncidentReview(input: {
    requesterModule: string;
    incidentType: string;
    evidenceRef: string;
  }): Promise<{ caseId: string; status: string }>;
}
