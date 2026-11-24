'use client';

import * as React from 'react';
import { toast } from 'sonner';
import { ThreadedStreamShell } from '../../@layouts/AppShells';
import { useAiStore, createAiProvider } from '../../@core/ai/aiStore';
import { Button } from '../../components/ui/Button';

const SUGGESTED_PROMPTS = [
  'Summarize last 7 days of revenue & churn',
  'Explain the spike in checkout error rate',
  'Draft a weekly executive ops update',
];

export function AiChatPage() {
  const {
    threads,
    activeThreadId,
    setActiveThread,
    createThread,
    deleteThread,
    appendMessage,
    updateLastAssistant,
    setMessageFeedback,
  } = useAiStore();
  const [prompt, setPrompt] = React.useState('');
  const [streaming, setStreaming] = React.useState(false);
  const abortRef = React.useRef<AbortController | null>(null);
  const provider = React.useMemo(() => createAiProvider('mock'), []);

  const activeThread = threads.find((t) => t.id === activeThreadId) ?? threads[0];

  const sendPrompt = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || streaming || !activeThread) return;

    const userMsg = { id: `u-${Date.now()}`, role: 'user' as const, content: trimmed };
    const assistantMsg = { id: `a-${Date.now() + 1}`, role: 'assistant' as const, content: '' };
    const nextHistory = [...activeThread.messages, userMsg];

    appendMessage(activeThread.id, userMsg);
    appendMessage(activeThread.id, assistantMsg);
    setPrompt('');
    setStreaming(true);

    const controller = new AbortController();
    abortRef.current = controller;

    let acc = '';
    try {
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

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    void sendPrompt(prompt);
  };

  return (
    <div className="anim-in">
      <ThreadedStreamShell
        threadsSidebar={
          <div className="space-y-3">
            <Button variant="solid" tone="primary" size="sm" fullWidth onClick={() => createThread()}>
              New Thread
            </Button>
            <ul className="space-y-1">
              {threads.map((t) => (
                <li key={t.id} className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setActiveThread(t.id)}
                    style={{
                      backgroundColor: t.id === activeThread?.id ? 'var(--color-primary-surface)' : 'transparent',
                      color: t.id === activeThread?.id ? 'var(--color-primary)' : 'var(--color-text)',
                      borderRadius: 'var(--radius-md)',
                    }}
                    className="flex-1 cursor-pointer truncate px-3 py-2 text-start text-xs font-medium"
                  >
                    {t.title}
                  </button>
                  {threads.length > 1 && (
                    <button
                      type="button"
                      aria-label={`Delete ${t.title}`}
                      onClick={() => deleteThread(t.id)}
                      style={{ color: 'var(--color-text-muted)' }}
                      className="cursor-pointer px-1.5 py-1 text-xs hover:opacity-80"
                    >
                      ×
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        }
        stream={
          <div aria-live="polite" className="space-y-3">
            {activeThread?.messages.length <= 1 && (
              <div className="flex flex-wrap gap-2 pb-2">
                {SUGGESTED_PROMPTS.map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => void sendPrompt(chip)}
                    style={{
                      backgroundColor: 'var(--color-surface)',
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text)',
                      borderRadius: 'var(--radius-full)',
                    }}
                    className="cursor-pointer border px-3 py-1.5 text-xs hover:opacity-80"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            )}
            {activeThread?.messages.map((m) => (
              <div
                key={m.id}
                style={{
                  backgroundColor: m.role === 'user' ? 'var(--color-primary)' : 'var(--color-canvas)',
                  color: m.role === 'user' ? 'var(--color-on-solid)' : 'var(--color-text)',
                  borderRadius: 'var(--radius-md)',
                }}
                className="max-w-2xl px-4 py-3 text-xs leading-relaxed"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="whitespace-pre-wrap">{m.content || 'Thinking...'}</span>
                  {m.role === 'assistant' && m.content && (
                    <div className="flex shrink-0 items-center gap-2">
                      <button
                        type="button"
                        aria-label="Copy response"
                        onClick={() => {
                          navigator.clipboard?.writeText(m.content);
                          toast.success('Copied response');
                        }}
                        className="cursor-pointer text-[11px] opacity-70 hover:opacity-100"
                      >
                        Copy
                      </button>
                      <button
                        type="button"
                        aria-label="Good response"
                        aria-pressed={m.feedback === 'up'}
                        onClick={() => setMessageFeedback(activeThread.id, m.id, 'up')}
                        className={`cursor-pointer text-[11px] ${m.feedback === 'up' ? 'opacity-100 font-semibold' : 'opacity-60 hover:opacity-100'}`}
                      >
                        +1
                      </button>
                      <button
                        type="button"
                        aria-label="Bad response"
                        aria-pressed={m.feedback === 'down'}
                        onClick={() => setMessageFeedback(activeThread.id, m.id, 'down')}
                        className={`cursor-pointer text-[11px] ${m.feedback === 'down' ? 'opacity-100 font-semibold' : 'opacity-60 hover:opacity-100'}`}
                      >
                        -1
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        }
        composer={
          <form onSubmit={handleSend} className="flex items-end gap-2">
            <textarea
              rows={1}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  void sendPrompt(prompt);
                }
              }}
              placeholder="Ask a question about your metrics... (Shift+Enter for newline)"
              aria-label="Chat prompt"
              style={{
                backgroundColor: 'var(--color-canvas)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text)',
                borderRadius: 'var(--radius-md)',
              }}
              className="max-h-32 min-h-[38px] flex-1 resize-none border px-3 py-2 text-sm"
            />
            {streaming ? (
              <Button type="button" variant="outline" tone="error" size="md" onClick={() => abortRef.current?.abort()}>
                Stop
              </Button>
            ) : (
              <Button type="submit" variant="solid" tone="primary" size="md">
                Send
              </Button>
            )}
          </form>
        }
      />
    </div>
  );
}
