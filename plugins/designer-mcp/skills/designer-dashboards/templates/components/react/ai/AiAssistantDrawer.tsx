'use client';

import * as React from 'react';
import { Drawer } from '../../components/ui/Drawer';
import { Button } from '../../components/ui/Button';
import {
  useAiStore,
  defaultMockAiProvider,
  type AiMessage,
  type AIProvider,
} from './aiStore';

export type { AiMessage, AIProvider };
export const mockAiProvider = defaultMockAiProvider;

const QUICK_PROMPTS = [
  'Summarize today’s KPI anomalies',
  'Why did p95 latency spike?',
  'Forecast Q4 MRR',
];

export interface AiAssistantDrawerProps {
  open: boolean;
  onClose: () => void;
  provider?: AIProvider;
  fullChatHref?: string;
}

export function AiAssistantDrawer({
  open,
  onClose,
  provider = defaultMockAiProvider,
  fullChatHref = '/apps/ai-chat',
}: AiAssistantDrawerProps) {
  const { threads, activeThreadId, appendMessage, updateLastAssistant } = useAiStore();
  const activeThread = threads.find((t) => t.id === activeThreadId) ?? threads[0];
  const [input, setInput] = React.useState('');
  const [streaming, setStreaming] = React.useState(false);
  const abortRef = React.useRef<AbortController | null>(null);

  const sendPrompt = async (text: string) => {
    const prompt = text.trim();
    if (!prompt || streaming || !activeThread) return;

    const userMsg: AiMessage = { id: `u-${Date.now()}`, role: 'user', content: prompt };
    const assistantMsg: AiMessage = { id: `a-${Date.now() + 1}`, role: 'assistant', content: '' };
    const nextHistory = [...activeThread.messages, userMsg];

    appendMessage(activeThread.id, userMsg);
    appendMessage(activeThread.id, assistantMsg);
    setInput('');
    setStreaming(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      let acc = '';
      for await (const chunk of provider.streamChat(nextHistory, controller.signal)) {
        if (controller.signal.aborted) break;
        acc += chunk;
        updateLastAssistant(activeThread.id, acc);
      }
    } catch (err) {
      if ((err as Error)?.name !== 'AbortError') {
        updateLastAssistant(activeThread.id, 'Unable to reach AI service. Please try again.');
      }
    } finally {
      setStreaming(false);
      abortRef.current = null;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void sendPrompt(input);
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="AI Assistant"
      description="Shared assistant chrome synced with /apps/ai-chat."
    >
      <div className="flex h-full flex-col gap-4">
        <div className="flex items-center justify-between gap-2">
          <span style={{ color: 'var(--color-text-muted)' }} className="truncate text-xs">
            {activeThread?.title}
          </span>
          <a
            href={fullChatHref}
            style={{ color: 'var(--color-primary)' }}
            className="shrink-0 text-xs font-medium hover:underline"
          >
            Open in AI Chat
          </a>
        </div>

        <div aria-live="polite" className="flex-1 space-y-3 overflow-y-auto">
          {activeThread?.messages.map((m) => (
            <div
              key={m.id}
              style={{
                backgroundColor:
                  m.role === 'user' ? 'var(--color-primary-surface)' : 'var(--color-canvas)',
                color: 'var(--color-text)',
                borderRadius: 'var(--radius-md)',
              }}
              className="p-3 text-sm whitespace-pre-wrap"
            >
              <p
                style={{ color: 'var(--color-text-muted)' }}
                className="mb-1 text-[10px] font-semibold uppercase tracking-wider"
              >
                {m.role}
              </p>
              {m.content || (
                <span className="typing-dots inline-flex gap-1" aria-label="Generating response">
                  <span />
                  <span />
                  <span />
                </span>
              )}
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-1.5">
          {QUICK_PROMPTS.map((q) => (
            <button
              key={q}
              type="button"
              disabled={streaming}
              onClick={() => void sendPrompt(q)}
              style={{
                backgroundColor: 'var(--color-canvas)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text-muted)',
                borderRadius: 'var(--radius-full)',
              }}
              className="cursor-pointer border px-2.5 py-1 text-[11px] hover:opacity-80 disabled:opacity-50"
            >
              {q}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question..."
            aria-label="Ask AI Assistant"
            style={{
              backgroundColor: 'var(--color-canvas)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text)',
              borderRadius: 'var(--radius-md)',
            }}
            className="h-9 flex-1 border px-3 text-sm"
          />
          {streaming ? (
            <Button
              type="button"
              variant="outline"
              tone="error"
              size="sm"
              aria-label="Stop generating"
              onClick={() => abortRef.current?.abort()}
            >
              Stop
            </Button>
          ) : (
            <Button type="submit" size="sm">
              Send
            </Button>
          )}
        </form>
      </div>
    </Drawer>
  );
}
