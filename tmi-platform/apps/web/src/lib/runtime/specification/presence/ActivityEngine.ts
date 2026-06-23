export interface ActivitySignal {
  userId: string;
  activity: "watching" | "chatting" | "live" | "idle";
  targetId?: string;
  updatedAtMs: number;
}

export interface ActivityEngine {
  getActivity(userId: string): Promise<ActivitySignal>;
}
