'use client';

import React, { createContext, useContext, useMemo, useState } from 'react';
import type { ComposerState, Conversation, Message, SafetyReportState } from './types';

interface ConversationStoreValue {
  currentUserId: string;
  conversations: Conversation[];
  setConversations: React.Dispatch<React.SetStateAction<Conversation[]>>;
  messageQueue: Record<string, Message[]>;
  setMessageQueue: React.Dispatch<React.SetStateAction<Record<string, Message[]>>>;
  currentConversationId: string | null;
  setCurrentConversationId: React.Dispatch<React.SetStateAction<string | null>>;
  composerState: ComposerState;
  setComposerState: React.Dispatch<React.SetStateAction<ComposerState>>;
  safetyReport: SafetyReportState;
  setSafetyReport: React.Dispatch<React.SetStateAction<SafetyReportState>>;
}

const ConversationStoreContext = createContext<ConversationStoreValue | null>(null);

export function ConversationStoreProvider({
  currentUserId,
  initialConversations,
  initialMessageQueue,
  children,
}: {
  currentUserId: string;
  initialConversations?: Conversation[];
  initialMessageQueue?: Record<string, Message[]>;
  children: React.ReactNode;
}) {
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations ?? []);
  const [messageQueue, setMessageQueue] = useState<Record<string, Message[]>>(initialMessageQueue ?? {});
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(
    initialConversations?.[0]?.id ?? null
  );
  const [composerState, setComposerState] = useState<ComposerState>({ text: '' });
  const [safetyReport, setSafetyReport] = useState<SafetyReportState>({ open: false });

  const value = useMemo<ConversationStoreValue>(
    () => ({
      currentUserId,
      conversations,
      setConversations,
      messageQueue,
      setMessageQueue,
      currentConversationId,
      setCurrentConversationId,
      composerState,
      setComposerState,
      safetyReport,
      setSafetyReport,
    }),
    [currentUserId, conversations, messageQueue, currentConversationId, composerState, safetyReport]
  );

  return <ConversationStoreContext.Provider value={value}>{children}</ConversationStoreContext.Provider>;
}

export function useConversationStore(): ConversationStoreValue {
  const ctx = useContext(ConversationStoreContext);
  if (!ctx) {
    throw new Error('useConversationStore must be used within ConversationStoreProvider');
  }
  return ctx;
}
