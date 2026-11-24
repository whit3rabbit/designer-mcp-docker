'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AiMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  feedback?: 'up' | 'down';
}

export interface AIProvider {
  streamChat(messages: AiMessage[], signal?: AbortSignal): AsyncIterable<string>;
}

export interface AiThread {
  id: string;
  title: string;
  updatedAt: number;
  messages: AiMessage[];
}

interface AiState {
  threads: AiThread[];
  activeThreadId: string;
  setActiveThread: (id: string) => void;
  createThread: (title?: string) => string;
  deleteThread: (id: string) => void;
  appendMessage: (threadId: string, msg: AiMessage) => void;
  updateLastAssistant: (threadId: string, content: string) => void;
  setMessageFeedback: (threadId: string, msgId: string, feedback: 'up' | 'down') => void;
}

const INITIAL_THREAD: AiThread = {
  id: 'default',
  title: 'Revenue & Latency Analysis',
  updatedAt: Date.now(),
  messages: [
    { id: 'm1', role: 'assistant', content: 'Ask me about revenue trends, anomalies, or p95 latency.' },
  ],
};

export const useAiStore = create<AiState>()(
  persist(
    (set) => ({
      threads: [INITIAL_THREAD],
      activeThreadId: 'default',
      setActiveThread: (activeThreadId) => set({ activeThreadId }),
      createThread: (title = 'New Conversation') => {
        const id = `thread-${Date.now()}`;
        set((s) => ({
          activeThreadId: id,
          threads: [
            {
              id,
              title,
              updatedAt: Date.now(),
              messages: [{ id: `m-${Date.now()}`, role: 'assistant', content: 'How can I help?' }],
            },
            ...s.threads,
          ],
        }));
        return id;
      },
      deleteThread: (id) =>
        set((s) => {
          const remaining = s.threads.filter((t) => t.id !== id);
          const threads = remaining.length > 0 ? remaining : [INITIAL_THREAD];
          const activeThreadId = s.activeThreadId === id ? threads[0].id : s.activeThreadId;
          return { threads, activeThreadId };
        }),
      appendMessage: (threadId, msg) =>
        set((s) => ({
          threads: s.threads.map((t) =>
            t.id === threadId ? { ...t, updatedAt: Date.now(), messages: [...t.messages, msg] } : t,
          ),
        })),
      updateLastAssistant: (threadId, content) =>
        set((s) => ({
          threads: s.threads.map((t) => {
            if (t.id !== threadId) return t;
            const copy = [...t.messages];
            const last = copy[copy.length - 1];
            if (last?.role === 'assistant') copy[copy.length - 1] = { ...last, content };
            return { ...t, updatedAt: Date.now(), messages: copy };
          }),
        })),
      setMessageFeedback: (threadId, msgId, feedback) =>
        set((s) => ({
          threads: s.threads.map((t) =>
            t.id === threadId
              ? {
                  ...t,
                  messages: t.messages.map((m) => (m.id === msgId ? { ...m, feedback } : m)),
                }
              : t,
          ),
        })),
    }),
    { name: 'rd-ai-threads' },
  ),
);

/** Deterministic mock token-by-token streamer (zero external secrets required) */
export const defaultMockAiProvider: AIProvider = {
  async *streamChat(messages, signal) {
    const last = messages[messages.length - 1]?.content ?? '';
    const reply = `Summary for "${last}": Revenue grew +12.4% MoM while API p95 latency improved to 42ms. Connect an authenticated /api/ai/chat Route Handler to enable live model responses.`;
    for (const token of reply.split(' ')) {
      if (signal?.aborted) return;
      await new Promise((r) => setTimeout(r, 35));
      yield `${token} `;
    }
  },
};

/** Server-proxied AI provider: calls authenticated /api/ai/chat (never exposes keys in client) */
export const serverApiAiProvider: AIProvider = {
  async *streamChat(messages, signal) {
    const res = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: messages.map(({ role, content }) => ({ role, content })) }),
      signal,
    });
    if (!res.ok || !res.body) {
      throw new Error(`AI endpoint error (${res.status})`);
    }
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      yield decoder.decode(value, { stream: true });
    }
  },
};

export function createAiProvider(mode: 'mock' | 'live' = 'mock'): AIProvider {
  return mode === 'live' ? serverApiAiProvider : defaultMockAiProvider;
}
