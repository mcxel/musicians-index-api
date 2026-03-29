"use client";

import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

export type QueueParticipant = {
  id: string;
  name: string;
  role?: "artist" | "producer" | "host" | "audience";
};

type TurnQueueContextValue = {
  isOpen: boolean;
  queue: QueueParticipant[];
  currentTurnId: string | null;
  isTurnLocked: boolean;
  openQueue: () => void;
  closeQueue: () => void;
  enqueue: (participant: QueueParticipant) => void;
  dequeue: (participantId: string) => void;
  nextTurn: () => void;
  releaseTurnLock: () => void;
};

const TurnQueueContext = createContext<TurnQueueContextValue | undefined>(undefined);

export function useTurnQueue() {
  const context = useContext(TurnQueueContext);
  if (!context) throw new Error("useTurnQueue must be used within TurnQueueProvider");
  return context;
}

export default function TurnQueueProvider({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [queue, setQueue] = useState<QueueParticipant[]>([]);
  const [currentTurnId, setCurrentTurnId] = useState<string | null>(null);
  const [isTurnLocked, setIsTurnLocked] = useState(false);

  const openQueue = useCallback(() => setIsOpen(true), []);
  const closeQueue = useCallback(() => setIsOpen(false), []);

  const enqueue = useCallback(
    (participant: QueueParticipant) => {
      const exists = queue.some((item) => item.id === participant.id);
      if (exists) return;
      setQueue([...queue, participant]);
    },
    [queue]
  );

  const dequeue = useCallback(
    (participantId: string) => {
      const nextQueue = queue.filter((item) => item.id !== participantId);
      setQueue(nextQueue);
      if (currentTurnId === participantId) {
        setCurrentTurnId(null);
      }
    },
    [queue, currentTurnId]
  );

  const nextTurn = useCallback(() => {
    if (queue.length === 0) {
      setCurrentTurnId(null);
      setIsTurnLocked(false);
      return;
    }

    const currentIndex = queue.findIndex((item) => item.id === currentTurnId);
    const nextIndex = currentIndex < 0 ? 0 : (currentIndex + 1) % queue.length;
    const nextParticipant = queue[nextIndex];

    setCurrentTurnId(nextParticipant?.id ?? null);
    setIsTurnLocked(!!nextParticipant);
  }, [queue, currentTurnId]);

  const releaseTurnLock = useCallback(() => setIsTurnLocked(false), []);

  const value = useMemo<TurnQueueContextValue>(
    () => ({
      isOpen,
      queue,
      currentTurnId,
      isTurnLocked,
      openQueue,
      closeQueue,
      enqueue,
      dequeue,
      nextTurn,
      releaseTurnLock,
    }),
    [
      isOpen,
      queue,
      currentTurnId,
      isTurnLocked,
      openQueue,
      closeQueue,
      enqueue,
      dequeue,
      nextTurn,
      releaseTurnLock,
    ]
  );

  return <TurnQueueContext.Provider value={value}>{children}</TurnQueueContext.Provider>;
}
