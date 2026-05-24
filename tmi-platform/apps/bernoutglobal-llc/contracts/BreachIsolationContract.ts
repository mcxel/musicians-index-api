export interface BreachResponseContract {
  startBreachResponse(input: {
    moduleId: string;
    incidentId: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
  }): Promise<{ chainId: string; status: 'CONTAINED' | 'QUARANTINED' | 'RECOVERED' | 'ESCALATED' | 'EMERGENCY_LOCKED' }>;
}

export interface ModuleIsolationContract {
  isolateModule(input: { moduleId: string; reason: string }): Promise<{ isolated: boolean; timestamp: number }>;
}

export interface EmergencyQuarantineContract {
  quarantineModule(input: { moduleId: string; incidentId: string }): Promise<{ status: 'QUARANTINED' | 'EMERGENCY_LOCKED'; timestamp: number }>;
}
