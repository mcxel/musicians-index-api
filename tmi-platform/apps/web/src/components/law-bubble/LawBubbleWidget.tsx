/**
 * ==================================================================================
 * LAW BUBBLE WIDGET - "THE CHEAPEST LAWYER YOU TRY FIRST"
 * ==================================================================================
 * 
 * $1 per question • Faster than Google • Action-based answers
 * 
 * Features:
 * - Wallet credits (buy once, ask many)
 * - SSE streaming for instant feedback
 * - Answer Contract format (front + key_points + actions + avoid + deadlines)
 * - Embeddable anywhere
 * 
 * ==================================================================================
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';

// ============================================================================
// TYPES
// ============================================================================

interface LawBubbleProps {
  userId?: string;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}

interface AnswerContract {
  front: string;
  key_points: string[];
  actions: string[];
  avoid: string[];
  deadlines: string[];
  followups: string[];
  disclaimer: string;
}

interface Message {
  id: string;
  question: string;
  answer?: AnswerContract;
  status: 'streaming' | 'complete' | 'error';
  cached?: boolean;
  topic?: string;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const LawBubbleWidget: React.FC<LawBubbleProps> = ({
  userId = 'guest',
  position = 'bottom-right',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [credits, setCredits] = useState(0);
  const [showBuyCredits, setShowBuyCredits] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch balance on mount
  useEffect(() => {
    fetchBalance();
  }, [userId]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchBalance = async () => {
    try {
      const res = await fetch(`/api/law-bubble/wallet?userId=${userId}`);
      const data = await res.json();
      setCredits(data.credits || 0);
    } catch (e) {
      console.error('Wallet fetch failed:', e);
    }
  };

  const purchaseCredits = async (amount: 5 | 10 | 20) => {
    try {
      const res = await fetch('/api/law-bubble/wallet?action=purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, userId }),
      });
      const data = await res.json();
      if (data.success) {
        setCredits(data.newBalance);
        setShowBuyCredits(false);
      }
    } catch (e) {
      console.error('Purchase failed:', e);
    }
  };

  const deductCredit = async (): Promise<boolean> => {
    try {
      const res = await fetch('/api/law-bubble/wallet?action=deduct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, credits: 1 }),
      });
      const data = await res.json();
      if (data.success) {
        setCredits(data.remainingCredits);
        return true;
      } else if (res.status === 402) {
        setShowBuyCredits(true);
        return false;
      }
    } catch (e) {
      console.error('Deduct failed:', e);
    }
    return false;
  };

  const askQuestion = async () => {
    if (!question.trim()) return;

    const canAsk = await deductCredit();
    if (!canAsk) return;

    const msgId = `msg_${Date.now()}`;
    const newMsg: Message = {
      id: msgId,
      question: question.trim(),
      status: 'streaming',
    };

    setMessages((prev) => [...prev, newMsg]);
    setQuestion('');

    try {
      const res = await fetch('/api/law-bubble/ask-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId: msgId,
          questionText: newMsg.question,
          userId,
          jurisdiction: { country: 'US' },
        }),
      });

      if (!res.body) throw new Error('No response body');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.slice(6));

            if (data.type === 'metadata') {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === msgId ? { ...m, topic: data.topic, cached: data.cached } : m
                )
              );
            } else if (data.type === 'answer') {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === msgId ? { ...m, status: 'complete', answer: data.answer } : m
                )
              );
            }
          }
        }
      }
    } catch (e) {
      console.error('Ask failed:', e);
      setMessages((prev) =>
        prev.map((m) => (m.id === msgId ? { ...m, status: 'error' } : m))
      );
    }
  };

  const positionClasses = {
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
  };

  return (
    <>
      {/* Minimized Bubble Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className={`fixed ${positionClasses[position]} z-50 w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full shadow-lg hover:scale-110 transition-transform flex items-center justify-center`}
        >
          <span className="text-2xl">⚖️</span>
          <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            $1
          </span>
        </button>
      )}

      {/* Expanded Panel */}
      {isOpen && (
        <div
          className={`fixed ${positionClasses[position]} z-50 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border-2 border-orange-300 flex flex-col`}
          style={{ maxHeight: '600px' }}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-yellow-50 to-burgundy-50 p-4 rounded-t-2xl border-b border-orange-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">⚖️</span>
              <div>
                <h3 className="font-bold text-gray-900">The Law Bubble</h3>
                <p className="text-xs text-gray-600">$1 legal info in plain English</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-orange-600">{credits} credits</span>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className="space-y-2">
                {/* User Question */}
                <div className="bg-blue-100 p-3 rounded-lg text-sm">
                  <p className="font-semibold text-blue-900">{msg.question}</p>
                  {msg.cached && (
                    <span className="text-xs text-green-600">⚡ Instant (cached)</span>
                  )}
                </div>

                {/* Answer */}
                {msg.status === 'streaming' && (
                  <p className="text-sm text-gray-500 italic">Thinking...</p>
                )}

                {msg.status === 'complete' && msg.answer && (
                  <div className="bg-gray-50 p-3 rounded-lg space-y-2 text-sm">
                    {/* Front Response */}
                    <p className="font-semibold text-gray-900">{msg.answer.front}</p>

                    {/* Key Points */}
                    <div>
                      <p className="text-xs font-semibold text-gray-700">📌 Key Points:</p>
                      {msg.answer.key_points.map((point, idx) => (
                        <p key={idx} className="text-gray-700 ml-2">
                          <span className="text-blue-500">•</span> {point}
                        </p>
                      ))}
                    </div>

                    {/* Actions (Green) */}
                    <div className="bg-green-50 border border-green-200 p-2 rounded">
                      <p className="text-xs font-semibold text-green-800">✓ Do This Next:</p>
                      {msg.answer.actions.map((action, idx) => (
                        <p key={idx} className="text-green-800 ml-2">→ {action}</p>
                      ))}
                    </div>

                    {/* Avoid (Red) */}
                    <div className="bg-red-50 border border-red-200 p-2 rounded">
                      <p className="text-xs font-semibold text-red-800">✗ Avoid:</p>
                      {msg.answer.avoid.map((item, idx) => (
                        <p key={idx} className="text-red-800 ml-2">{item}</p>
                      ))}
                    </div>

                    {/* Deadlines (Yellow) */}
                    {msg.answer.deadlines.length > 0 && (
                      <div className="bg-yellow-50 border border-yellow-300 p-2 rounded">
                        <p className="text-xs font-semibold text-yellow-800">⏰ Deadlines / Urgent:</p>
                        {msg.answer.deadlines.map((deadline, idx) => (
                          <p key={idx} className="text-yellow-800 ml-2">{deadline}</p>
                        ))}
                      </div>
                    )}

                    {/* Follow-ups */}
                    {msg.answer.followups.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-gray-700">💬 Quick Follow-ups:</p>
                        {msg.answer.followups.map((q, idx) => (
                          <p key={idx} className="text-gray-600 ml-2 italic">{q}</p>
                        ))}
                      </div>
                    )}

                    {/* Disclaimer */}
                    <p className="text-xs text-gray-400 border-t pt-2">{msg.answer.disclaimer}</p>

                    {/* Upsell */}
                    <button
                      onClick={() => {
                        setQuestion('');
                        document.querySelector<HTMLTextAreaElement>('textarea')?.focus();
                      }}
                      className="text-sm text-orange-600 hover:underline"
                    >
                      Need more? Ask another for $1 →
                    </button>
                  </div>
                )}

                {msg.status === 'error' && (
                  <p className="text-sm text-red-600">Error processing question</p>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-gray-200">
            <p className="text-xs text-gray-500 mb-2">Fast answer + what to do next</p>
            <div className="flex gap-2">
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    askQuestion();
                  }
                }}
                placeholder="Ask any legal question..."
                className="flex-1 p-2 border border-gray-300 rounded-lg text-sm resize-none"
                rows={2}
              />
              <button
                onClick={askQuestion}
                disabled={!question.trim()}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-orange-700 transition-colors"
              >
                Send
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Information only • Not legal advice{' '}
              {credits === 0 && (
                <button
                  onClick={() => setShowBuyCredits(true)}
                  className="text-orange-600 underline"
                >
                  (Buy credits)
                </button>
              )}
            </p>
          </div>
        </div>
      )}

      {/* Buy Credits Modal */}
      {showBuyCredits && (
        <div className="fixed inset-0 z-[60] bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl shadow-xl max-w-md">
            <h3 className="text-lg font-bold mb-4">Buy Credits</h3>
            <div className="space-y-2">
              <button
                onClick={() => purchaseCredits(5)}
                className="w-full p-3 bg-gray-100 hover:bg-gray-200 rounded-lg text-left"
              >
                <span className="font-semibold">$5</span> → 5 credits (0% bonus)
              </button>
              <button
                onClick={() => purchaseCredits(10)}
                className="w-full p-3 bg-blue-50 hover:bg-blue-100 rounded-lg text-left border border-blue-300"
              >
                <span className="font-semibold">$10</span> → 12 credits (+2 bonus = 20%)
              </button>
              <button
                onClick={() => purchaseCredits(20)}
                className="w-full p-3 bg-green-50 hover:bg-green-100 rounded-lg text-left border border-green-300"
              >
                <span className="font-semibold">$20</span> → 25 credits (+5 bonus = 25%)
              </button>
            </div>
            <button
              onClick={() => setShowBuyCredits(false)}
              className="mt-4 w-full p-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default LawBubbleWidget;
