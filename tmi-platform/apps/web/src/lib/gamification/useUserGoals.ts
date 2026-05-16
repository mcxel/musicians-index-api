export interface UserGoal {
  id: string;
  text: string;
  completed: boolean;
}

const LOBBY_GOALS: UserGoal[] = [
  { id: "g1", text: "Wave to 3 people in the lobby", completed: false },
  { id: "g2", text: "Check the show schedule", completed: false },
  { id: "g3", text: "Update your avatar", completed: false },
  { id: "g4", text: "Visit the store", completed: false },
];

export function useUserGoals(_userId: string): UserGoal[] {
  return LOBBY_GOALS;
}
