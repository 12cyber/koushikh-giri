import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MessageSquare,
  X,
  Send,
  RotateCcw,
  Sparkles,
  Zap,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { generateFibonacciLabResponse } from '../utils/fibonacciMath';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}

type PersonaKey = 'curator' | 'leonardo' | 'biophysicist' | 'algorithmist';
type ModelChoice = 'gemini-3.8-flash' | 'gemini-3.1-flash-lite';

const PERSONAS: Array<{ id: PersonaKey; label: string; subtitle: string }> = [
  {
    id: 'curator',
    label: 'Lab Curator',
    subtitle: 'Comprehensive mathematics, geometry & golden ratio',
  },
  {
    id: 'leonardo',
    label: 'Leonardo of Pisa',
    subtitle: '1202 Liber Abaci & historical origins',
  },
  {
    id: 'biophysicist',
    label: 'Biophysicist',
    subtitle: 'Plant phyllotaxis, 137.5° packing & science vs. myth',
  },
  {
    id: 'algorithmist',
    label: 'CS Theorist',
    subtitle: 'Big-O complexity, fast doubling & Fibonacci heaps',
  },
];

const SUGGESTED_QUESTIONS = [
  'Why does dividing consecutive Fibonacci numbers approach 1.618?',
  'Why do sunflowers grow in 34 and 55 spirals?',
  'What is F(100) and how fast can we compute it?',
  'Is the Nautilus shell really a Golden Ratio spiral?',
  'Decompose 2026 using Zeckendorf’s Theorem',
];

const INITIAL_MESSAGE: ChatMessage = {
  id: 'welcome-0',
  role: 'model',
  text: 'Welcome to the Fibonacci Laboratory Research Console. Ask me anything about recurrence relations, the Golden Ratio (φ ≈ 1.618), spiral geometry, plant phyllotaxis, or algorithmic complexity—or ask me to calculate any F(n).',
  timestamp: 'Ready',
};

export const FibonacciChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [persona, setPersona] = useState<PersonaKey>('curator');
  const [modelChoice, setModelChoice] = useState<ModelChoice>('gemini-3.8-flash');
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
  const [inputValue, setInputValue] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const threadEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      threadEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      inputRef.current?.focus();
    }
  }, [messages, isOpen, isLoading]);

  const sendMessage = async (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedHistory = [...messages, userMsg];
    setMessages(updatedHistory);
    setInputValue('');
    setIsLoading(true);

    let replyText = '';

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedHistory.map((m) => ({
            role: m.role,
            text: m.text,
          })),
          modelChoice,
          persona,
        }),
      });

      const contentType = response.headers.get('content-type') || '';
      if (response.ok && contentType.includes('application/json')) {
        const data = await response.json();
        if (data && typeof data.reply === 'string' && data.reply.trim()) {
          replyText = data.reply.trim();
        }
      }
    } catch {
      // Fall through to local knowledge engine if network or endpoint is unavailable
    }

    if (!replyText) {
      // Brief natural pause so the laboratory assistant feels responsive and smooth
      await new Promise((resolve) => setTimeout(resolve, 260));
      replyText = generateFibonacciLabResponse(trimmed, persona);
    }

    const modelMsg: ChatMessage = {
      id: `model-${Date.now()}`,
      role: 'model',
      text: replyText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, modelMsg]);
    setIsLoading(false);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputValue);
  };

  const handleResetChat = () => {
    setMessages([INITIAL_MESSAGE]);
  };

  const activePersonaObj = PERSONAS.find((p) => p.id === persona) || PERSONAS[0];

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            key="chat-trigger"
            initial={{ opacity: 0, y: 12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.95 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            type="button"
            onClick={() => setIsOpen(true)}
            className="fixed bottom-16 md:bottom-6 right-4 sm:right-6 z-50 px-4 py-3 rounded-xl bg-[#050b16]/95 hover:bg-cyan-950/90 text-cyan-300 hover:text-white border border-cyan-400/50 shadow-[0_0_30px_rgba(6,182,212,0.35)] flex items-center gap-3 font-mono text-xs font-bold tracking-widest uppercase transition-colors cursor-pointer group"
            aria-label="Open Fibonacci Research Assistant"
          >
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <MessageSquare className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
            <span>ASK THE LAB</span>
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.section
            key="chat-window"
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
            aria-label="Fibonacci Research Assistant Chat"
            className={`fixed z-50 bg-[#030710]/95 backdrop-blur-xl border border-cyan-400/40 shadow-[0_0_60px_rgba(0,0,0,0.85)] flex flex-col transition-all duration-300 ${
              isExpanded
                ? 'inset-3 sm:inset-6 md:inset-10 rounded-2xl'
                : 'bottom-14 md:bottom-6 left-3 right-3 sm:left-auto sm:right-6 sm:w-[440px] h-[560px] max-h-[82vh] rounded-2xl'
            }`}
          >
            {/* Console Top Header */}
            <div className="px-4 py-3.5 border-b border-white/10 flex items-center justify-between bg-[#050b16] rounded-t-2xl">
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <div>
                  <h3 className="font-['Arial',sans-serif] text-base sm:text-lg font-bold text-white tracking-wide uppercase leading-none">
                    Fibonacci Lab Assistant
                  </h3>
                  <p className="font-mono text-[10px] text-cyan-300 mt-0.5">
                    {activePersonaObj.subtitle}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleResetChat}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                  title="Clear conversation"
                  aria-label="Clear conversation"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsExpanded((prev) => !prev)}
                  className="hidden sm:inline-flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                  title={isExpanded ? 'Restore window size' : 'Expand window'}
                  aria-label={isExpanded ? 'Restore window size' : 'Expand window'}
                >
                  {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                  title="Close chat"
                  aria-label="Close chat"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Role & Speed Mode Controls */}
            <div className="px-4 py-2.5 border-b border-white/10 bg-[#040812] flex flex-col gap-2">
              <div className="flex items-center gap-1 overflow-x-auto pb-0.5">
                {PERSONAS.map((p) => {
                  const isSelected = persona === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPersona(p.id)}
                      className={`px-2.5 py-1 rounded text-[11px] font-mono transition-colors whitespace-nowrap cursor-pointer ${
                        isSelected
                          ? 'bg-cyan-400 text-slate-950 font-bold'
                          : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-white/5'
                      }`}
                    >
                      {p.label}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                <span>Engine Mode:</span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setModelChoice('gemini-3.8-flash')}
                    className={`px-2 py-0.5 rounded flex items-center gap-1 transition-colors cursor-pointer ${
                      modelChoice === 'gemini-3.8-flash'
                        ? 'bg-[#ff69b4] text-slate-950 font-bold'
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Deep Analysis</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setModelChoice('gemini-3.1-flash-lite')}
                    className={`px-2 py-0.5 rounded flex items-center gap-1 transition-colors cursor-pointer ${
                      modelChoice === 'gemini-3.1-flash-lite'
                        ? 'bg-[#ff69b4] text-slate-950 font-bold'
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    <Zap className="w-3 h-3" />
                    <span>Fast Pulse</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Scrollable Conversation Thread */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
              {messages.map((msg) => {
                const isUser = msg.role === 'user';
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                    className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-center gap-2 font-mono text-[10px] text-slate-500 mb-1 px-1">
                      <span>{isUser ? 'Visitor' : activePersonaObj.label}</span>
                      <span aria-hidden="true">·</span>
                      <span>{msg.timestamp}</span>
                    </div>

                    <div
                      className={`max-w-[88%] rounded-xl px-4 py-3 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                        isUser
                          ? 'bg-cyan-500/20 text-cyan-100 border border-cyan-400/40'
                          : 'bg-[#070d19] text-slate-200 border border-white/10'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </motion.div>
                );
              })}

              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-start"
                >
                  <div className="font-mono text-[10px] text-cyan-400 mb-1 px-1">
                    {activePersonaObj.label} · Computing...
                  </div>
                  <div className="rounded-xl px-4 py-3 bg-[#070d19] border border-cyan-500/30 font-mono text-xs text-amber-300 flex items-center gap-2">
                    <span className="inline-block w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                    <span>0 → 1 → 1 → 2 → 3 → 5 → Synthesizing response...</span>
                  </div>
                </motion.div>
              )}

              {/* Starter Prompt Suggestions */}
              {!isLoading && (
                <div className="pt-2">
                  <div className="font-mono text-[10px] text-slate-500 uppercase tracking-wider mb-2">
                    {messages.length <= 1 ? 'Suggested Inquiries' : 'Follow-up Inquiries'}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {SUGGESTED_QUESTIONS.map((q) => (
                      <button
                        key={q}
                        type="button"
                        onClick={() => sendMessage(q)}
                        className="text-left px-3 py-1.5 rounded-lg bg-[#050b14] hover:bg-cyan-950/40 border border-white/10 hover:border-cyan-400/40 text-[11px] text-slate-300 hover:text-cyan-200 transition-colors cursor-pointer"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div ref={threadEndRef} />
            </div>

            {/* Input Bar */}
            <form
              onSubmit={handleFormSubmit}
              className="p-3 border-t border-white/10 bg-[#050b16] rounded-b-2xl flex items-center gap-2"
            >
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask about Fibonacci, F(50), φ, spirals, or nature..."
                disabled={isLoading}
                className="flex-1 bg-[#020408] text-slate-100 placeholder:text-slate-500 text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-white/15 focus:outline-none focus:border-cyan-400 font-sans"
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isLoading}
                className="px-4 py-2.5 rounded-xl bg-[#ff69b4] hover:bg-pink-300 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-mono text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer shrink-0 shadow-[0_0_15px_rgba(255,105,180,0.4)]"
                aria-label="Send question"
              >
                <span>Send</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </motion.section>
        )}
      </AnimatePresence>
    </>
  );
};
