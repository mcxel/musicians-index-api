'use client';

import React, { useState } from 'react';
import { useConversationStore } from './ConversationStore';
import { MemoryMediaPicker, type MemoryArtifact } from './MemoryMediaPicker';
import type { Message } from './types';

const mockArtifacts: MemoryArtifact[] = [
  { id: 'artifact_1', label: 'Backstage Selfie' },
  { id: 'artifact_2', label: 'Crowd Clip' },
];

export function MessageComposer() {
  const {
    currentConversationId,
    currentUserId,
    composerState,
    setComposerState,
    setMessageQueue,
  } = useConversationStore();

  const [pickerOpen, setPickerOpen] = useState(false);

  const send = () => {
    if (!currentConversationId || !composerState.text.trim()) return;

    const msg: Message = {
      id: `msg_${Date.now()}`,
      conversationId: currentConversationId,
      senderId: currentUserId,
      senderName: 'You',
      senderRole: 'fan',
      messageType: 'text',
      text: composerState.text.trim(),
      status: 'sent',
      createdAt: Date.now(),
      moderationStatus: 'approved',
      scanStatus: 'clean',
      adminApproved: false,
    };

    setMessageQueue((prev) => ({
      ...prev,
      [currentConversationId]: [...(prev[currentConversationId] ?? []), msg],
    }));

    setComposerState({ text: '' });
  };

  return (
    <div style={{ borderTop: '1px solid #1f1f3a', padding: 10, background: '#0b0b22' }}>
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={() => setPickerOpen(true)}
          style={{
            border: '1px solid #2f2f5a',
            background: '#17173a',
            color: '#fff',
            borderRadius: 8,
            padding: '8px 10px',
            cursor: 'pointer',
          }}
        >
          Memory Picker
        </button>
        <input
          value={composerState.text}
          onChange={(e) => setComposerState((s) => ({ ...s, text: e.target.value }))}
          placeholder="Type a message..."
          style={{
            flex: 1,
            background: '#141432',
            border: '1px solid #2f2f5a',
            color: '#fff',
            borderRadius: 8,
            padding: '8px 10px',
            outline: 'none',
          }}
        />
        <button
          onClick={send}
          style={{
            border: 'none',
            background: '#00d5ff',
            color: '#041122',
            borderRadius: 8,
            padding: '8px 14px',
            fontWeight: 800,
            cursor: 'pointer',
          }}
        >
          Send
        </button>
      </div>

      <MemoryMediaPicker
        open={pickerOpen}
        artifacts={mockArtifacts}
        onClose={() => setPickerOpen(false)}
        onSelect={(artifactId) => {
          setComposerState((s) => ({ ...s, selectedMemoryArtifactId: artifactId }));
          setPickerOpen(false);
        }}
      />
    </div>
  );
}
