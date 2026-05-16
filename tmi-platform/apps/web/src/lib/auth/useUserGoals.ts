import { useState } from 'react';

export const useUserGoals = (userId: string) => {
  // Mocking goals pulled from GoalEngine
  const [goals] = useState([
    { id: 'g1', text: 'React 3 times', completed: true },
    { id: 'g2', text: 'Try a prop', completed: false },
    { id: 'g3', text: 'Claim a seat', completed: false },
  ]);
  return goals;
};