'use client';

import React from 'react';
import { useConversationStore } from './ConversationStore';
import { MessageBubble } from './MessageBubble';

export function ChatThread({ conversationId }: { conversationId: string | null }) {
  const { messageQueue } = useConversationStore();

  if (!conversationId) {
    return (
      <div style={{ display: 'grid', placeItems: 'center', color: '#9aa0c2' }}>
        Select a conversation to begin.
      </div>
    );
  }

  const messages = messageQueue[conversationId] ?? [];

  return (
    <div style={{ overflowY: 'auto', padding: 14 }}>
      {messages.length === 0 ? (
        <div style={{ color: '#9aa0c2', fontSize: 13 }}>No messages in this thread yet.</div>
      ) : (
        messages.map((m) => <MessageBubble key={m.id} message={m} />)
      )}
    </div>
  );
}
