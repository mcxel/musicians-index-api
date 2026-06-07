'use client';

import React, { useEffect, useState } from 'react';
import { MessengerShell } from '@/components/messenger/MessengerShell';
import type { Conversation, Message, ConversationType } from '@/components/messenger/types';

// ── Fallback data shown before API loads ──────────────────────────────────────
const FALLBACK_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv_dm_1',
    type: 'dm',
    participantIds: ['user_me', 'user_a'],
    title: 'Ralph',
    lastMessageAt: Date.now() - 1000 * 60 * 3,
    createdAt: Date.now() - 1000 * 60 * 60 * 24,
    updatedAt: Date.now() - 1000 * 60 * 3,
  },
  {
    id: 'conv_group_1',
    type: 'group',
    participantIds: ['user_me', 'user_a', 'user_b'],
    title: 'Cypher Group',
    lastMessageAt: Date.now() - 1000 * 60 * 14,
    createdAt: Date.now() - 1000 * 60 * 60 * 48,
    updatedAt: Date.now() - 1000 * 60 * 14,
  },
];

const FALLBACK_QUEUE: Record<string, Message[]> = {
  conv_dm_1: [
    {
      id: 'm1', conversationId: 'conv_dm_1', senderId: 'user_a', senderName: 'Ralph',
      senderRole: 'artist', messageType: 'text', text: 'Yo, check this cut',
      status: 'sent', createdAt: Date.now() - 1000 * 60 * 10,
      moderationStatus: 'approved', scanStatus: 'clean', adminApproved: false,
    },
  ],
};

// ── API response → Messenger types ───────────────────────────────────────────

function kindToType(kind: string): ConversationType {
  if (kind === 'group' || kind === 'band') return kind as ConversationType;
  return 'dm';
}

function mapThreads(threads: Record<string, unknown>[]): {
  conversations: Conversation[];
  messageQueue: Record<string, Message[]>;
} {
  const conversations: Conversation[] = [];
  const messageQueue: Record<string, Message[]> = {};

  for (const t of threads) {
    const id = t.threadId as string;
    const participants = (t.participants as Record<string, unknown>[]) ?? [];
    const msgs = (t.messages as Record<string, unknown>[]) ?? [];
    const lastMsg = t.lastMessage as Record<string, unknown> | null;

    const title =
      participants.length === 1
        ? (participants[0]?.displayName as string) ?? 'Unknown'
        : participants.map((p) => p.displayName).filter(Boolean).join(', ') || 'Group';

    conversations.push({
      id,
      type: kindToType(t.kind as string),
      participantIds: participants.map((p) => p.userId as string),
      title,
      lastMessageAt: lastMsg ? (lastMsg.createdAt as number) : (t.createdAt as number),
      createdAt: t.createdAt as number,
      updatedAt: t.updatedAt as number,
    });

    messageQueue[id] = msgs.map((m) => ({
      id: m.messageId as string,
      conversationId: id,
      senderId: m.senderId as string,
      senderName: m.senderName as string,
      senderRole: 'member',
      messageType: (m.type as Message['messageType']) ?? 'text',
      text: m.body as string | undefined,
      status: 'sent' as const,
      createdAt: m.createdAt as number,
      moderationStatus: 'approved' as const,
      scanStatus: 'clean' as const,
      adminApproved: false,
    }));
  }

  return { conversations, messageQueue };
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>(FALLBACK_CONVERSATIONS);
  const [messageQueue, setMessageQueue] = useState<Record<string, Message[]>>(FALLBACK_QUEUE);
  const [currentUserId, setCurrentUserId] = useState('user_me');

  useEffect(() => {
    fetch('/api/messages')
      .then((r) => {
        if (!r.ok) return null;
        return r.json();
      })
      .then((data) => {
        if (!data?.threads || !Array.isArray(data.threads) || data.threads.length === 0) return;
        const { conversations: live, messageQueue: liveQueue } = mapThreads(data.threads);
        setConversations(live);
        setMessageQueue(liveQueue);
      })
      .catch(() => {});

    // Resolve current user from session cookie
    fetch('/api/auth/session')
      .then((r) => r.ok ? r.json() : null)
      .then((session) => {
        if (session?.user?.id) setCurrentUserId(session.user.id);
      })
      .catch(() => {});
  }, []);

  return (
    <main style={{ padding: 16, background: '#07071a', minHeight: '100vh' }}>
      <MessengerShell
        currentUserId={currentUserId}
        conversations={conversations}
        messageQueue={messageQueue}
      />
    </main>
  );
}
