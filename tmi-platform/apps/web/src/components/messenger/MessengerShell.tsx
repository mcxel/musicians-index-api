'use client';

import React from 'react';
import { ConversationStoreProvider, useConversationStore } from './ConversationStore';
import type { Conversation, Message } from './types';
import { ConversationList } from './ConversationList';
import { ChatThread } from './ChatThread';
import { MessageComposer } from './MessageComposer';
import { SafetyReportModal } from './SafetyReportModal';

const shellStyles: Record<string, React.CSSProperties> = {
  root: {
    display: 'grid',
    gridTemplateColumns: '320px 1fr',
    minHeight: 'calc(100vh - 80px)',
    background: '#080818',
    color: '#fff',
    border: '1px solid #1f1f3a',
    borderRadius: 12,
    overflow: 'hidden',
  },
  listPane: {
    borderRight: '1px solid #1f1f3a',
    background: '#0d0d24',
  },
  threadPane: {
    display: 'grid',
    gridTemplateRows: '1fr auto',
    minHeight: 0,
    background: '#0a0a1d',
  },
};

function MessengerShellBody() {
  const { currentConversationId } = useConversationStore();

  return (
    <div style={shellStyles.root}>
      <aside style={shellStyles.listPane}>
        <ConversationList />
      </aside>
      <section style={shellStyles.threadPane}>
        <ChatThread conversationId={currentConversationId} />
        <MessageComposer />
      </section>
      <SafetyReportModal />
    </div>
  );
}

export function MessengerShell({
  currentUserId,
  conversations,
  messageQueue,
}: {
  currentUserId: string;
  conversations: Conversation[];
  messageQueue: Record<string, Message[]>;
}) {
  return (
    <ConversationStoreProvider
      currentUserId={currentUserId}
      initialConversations={conversations}
      initialMessageQueue={messageQueue}
    >
      <MessengerShellBody />
    </ConversationStoreProvider>
  );
}
