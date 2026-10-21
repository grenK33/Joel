import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  Volume2,
  VolumeX,
  Mic,
  Copy,
  Check,
  Radio,
  FileText,
  User,
  ShieldCheck,
  RefreshCw,
  Mail
} from 'lucide-react';
import { INITIAL_GREETING, GREN_PROFILE } from '../data/grenResumeData';
import { playWavBase64 } from '../utils/audioUtils';

export interface ChatMessage {
  id: string;
  role: 'assistant' | 'user';
  content: string;
  timestamp: string;
}

interface ChatInterfaceProps {
  onStartLiveVoice: () => void;
  onOpenAudit: () => void;
  onOpenContact: () => void;
  initialQuestion?: string;
  clearInitialQuestion?: () => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  onStartLiveVoice,
  onOpenAudit,
  onOpenContact,
  initialQuestion,
  clearInitialQuestion,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'initial',
      role: 'assistant',
      content: INITIAL_GREETING,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentlySpeakingId, setCurrentlySpeakingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Handle passed-in initial question (e.g. from audit cards)
  useEffect(() => {
    if (initialQuestion) {
      handleSendMessage(initialQuestion);
      if (clearInitialQuestion) {
        clearInitialQuestion();
      }
    }
  }, [initialQuestion]);

  const handleSendMessage = async (customText?: string) => {
    const textToSend = (customText || inputPrompt).trim();
    if (!textToSend || isLoading) return;

    setInputPrompt('');

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to get answer from Joel');
      }

      const data = await response.json();
      const reply = data.reply || "I'm here to answer questions about Gren's professional background and perception audit.";

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('Chat error:', msg);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `I encountered an issue retrieving that detail: ${msg}. Please ensure your API key is configured or ask another question about Gren's perception audit.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const speakMessage = async (messageId: string, text: string) => {
    if (currentlySpeakingId === messageId) {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setCurrentlySpeakingId(null);
      return;
    }

    setCurrentlySpeakingId(messageId);
    let played = false;

    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voice: 'Fenrir' }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.audio) {
          await playWavBase64(data.audio);
          played = true;
        }
      }
    } catch (e) {
      console.warn('Backend TTS failed, using browser speech synthesis fallback:', e);
    }

    // Graceful fallback to Web Speech API
    if (!played && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const cleanText = text.replace(/[*_#`]/g, '');
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.onend = () => setCurrentlySpeakingId(null);
        utterance.onerror = () => setCurrentlySpeakingId(null);
        window.speechSynthesis.speak(utterance);
        return;
      } catch (err) {
        console.error('Speech synthesis error:', err);
      }
    }

    setCurrentlySpeakingId(null);
  };

  const copyToClipboard = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col h-[calc(100vh-140px)] min-h-[500px] px-4 py-4">
      {/* Top Quick Suggestions Header */}
      <div className="pb-3 border-b border-slate-800/80 mb-3 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1.5 flex-nowrap shrink-0">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1 mr-1">
            <Sparkles className="w-3 h-3 text-amber-400" /> Suggested:
          </span>
          {GREN_PROFILE.suggestedQuestions.slice(0, 4).map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(q)}
              className="text-xs bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-amber-300 border border-slate-800 px-2.5 py-1 rounded-lg whitespace-nowrap transition-all shadow-sm"
            >
              {q}
            </button>
          ))}
        </div>

        <button
          onClick={onStartLiveVoice}
          className="shrink-0 text-xs font-semibold px-2.5 py-1 rounded-lg bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 border border-indigo-500/30 flex items-center gap-1.5 transition-all"
        >
          <Radio className="w-3 h-3 text-indigo-400 animate-pulse" />
          <span>Switch to Voice</span>
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {messages.map((message) => {
          const isAssistant = message.role === 'assistant';

          return (
            <div
              key={message.id}
              className={`flex gap-3 text-sm ${isAssistant ? 'items-start' : 'items-end justify-end'}`}
            >
              {isAssistant && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-orange-500 p-0.5 shrink-0 shadow-md">
                  <div className="w-full h-full bg-slate-950 rounded-full flex items-center justify-center text-amber-400 font-bold text-xs">
                    J
                  </div>
                </div>
              )}

              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3.5 shadow-md ${
                  isAssistant
                    ? 'bg-slate-900 border border-slate-800 text-slate-200'
                    : 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-slate-950 font-medium'
                }`}
              >
                {isAssistant && (
                  <div className="flex items-center justify-between gap-2 mb-1.5 pb-1 border-b border-slate-800/60">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-bold text-amber-400">Joel</span>
                      <span className="text-[10px] text-slate-400">· Gren&apos;s AI Representative</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => speakMessage(message.id, message.content)}
                        className={`p-1 rounded hover:bg-slate-800 transition-colors ${
                          currentlySpeakingId === message.id
                            ? 'text-amber-400 animate-pulse'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                        title={currentlySpeakingId === message.id ? 'Speaking...' : 'Listen to Joel speak'}
                      >
                        {currentlySpeakingId === message.id ? (
                          <Volume2 className="w-3.5 h-3.5" />
                        ) : (
                          <Volume2 className="w-3.5 h-3.5" />
                        )}
                      </button>

                      <button
                        onClick={() => copyToClipboard(message.id, message.content)}
                        className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                        title="Copy answer"
                      >
                        {copiedId === message.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                )}

                <div className="whitespace-pre-wrap leading-relaxed text-xs sm:text-sm">
                  {message.content}
                </div>

                <div
                  className={`text-[10px] mt-1.5 flex items-center justify-end ${
                    isAssistant ? 'text-slate-500' : 'text-slate-900/70 font-semibold'
                  }`}
                >
                  {message.timestamp}
                </div>
              </div>

              {!isAssistant && (
                <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 text-slate-300">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {isLoading && (
          <div className="flex gap-3 text-sm items-start">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-orange-500 p-0.5 shrink-0 animate-pulse">
              <div className="w-full h-full bg-slate-950 rounded-full flex items-center justify-center text-amber-400 font-bold text-xs">
                J
              </div>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3 flex items-center gap-2 text-xs text-slate-400">
              <RefreshCw className="w-3.5 h-3.5 text-amber-400 animate-spin" />
              <span>Joel is referencing Gren&apos;s perception audit...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form Bar */}
      <div className="pt-3 border-t border-slate-800/80">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-1.5 focus-within:border-amber-500/50 shadow-lg"
        >
          <button
            type="button"
            onClick={onStartLiveVoice}
            className="p-2.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-indigo-400 transition-colors"
            title="Start Live Voice conversation with Joel (Gemini 3.8 Live)"
          >
            <Mic className="w-5 h-5" />
          </button>

          <input
            ref={inputRef}
            type="text"
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            placeholder="Ask Joel about Gren's skills, work under pressure, team fit..."
            className="flex-1 bg-transparent px-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
            disabled={isLoading}
          />

          <button
            type="submit"
            disabled={!inputPrompt.trim() || isLoading}
            className={`p-2.5 rounded-xl font-medium transition-all ${
              inputPrompt.trim() && !isLoading
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-800/50 text-slate-600 cursor-not-allowed'
            }`}
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

        <div className="flex items-center justify-between text-[11px] text-slate-500 px-2 mt-2">
          <span>All answers strictly sourced from Perception Audit (Oct 5, 2026).</span>
          <button
            onClick={onOpenAudit}
            className="hover:text-amber-400 transition-colors flex items-center gap-1"
          >
            <FileText className="w-3 h-3" /> View Source Document
          </button>
        </div>
      </div>
    </div>
  );
};
