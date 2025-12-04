"use client";

import { useMemo, useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { VoiceInput } from "@/components/ui/voice-input";
import { Bot, User, Sparkles, Send, Mic } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/components/providers/language-provider";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function AIPage() {
  const { language } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hi! I'm your HealthVault AI assistant. I can help you understand your health records, explain medications, or suggest healthy habits. How can I help you today?"
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    containerRef.current?.scrollTo({
      top: containerRef.current.scrollHeight,
      behavior: "smooth"
    });
  }, [messages]);

  const insights = useMemo(() => {
    const lastAssistant = [...messages]
      .reverse()
      .find((m) => m.role === "assistant");
    return lastAssistant?.content || "Ask a question to see insights here.";
  }, [messages]);

  const sendMessage = async (overrideText?: string) => {
    const textToSend = overrideText ?? input;
    if (!textToSend.trim()) return;

    const newMessage: Message = { role: "user", content: textToSend.trim() };
    setMessages((prev) => [...prev, newMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: textToSend, language }),
      });

      if (!res.ok) {
        throw new Error("AI request failed");
      }
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);

      // Gamification
      try {
        await fetch("/api/achievements/update", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "ai" })
        });
      } catch {
        // ignore
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "I'm having trouble connecting to the AI service right now. Please check your internet connection or try again later."
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void sendMessage();
  };

  return (
    <div className="space-y-6 h-[calc(100vh-140px)] flex flex-col">
      <div className="flex flex-col gap-2 shrink-0">
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          AI Health Assistant
        </h1>
        <p className="text-slate-400">
          Your personal health companion. Ask about symptoms, reports, or wellness tips.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3 flex-1 min-h-0">
        {/* Chat Area */}
        <div className="md:col-span-2 glass-card flex flex-col overflow-hidden border border-white/10 shadow-2xl">
          <div
            ref={containerRef}
            className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth"
          >
            <AnimatePresence initial={false}>
              {messages.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-4 ${message.role === "user" ? "flex-row-reverse" : "flex-row"
                    }`}
                >
                  <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${message.role === "user" ? "bg-emerald-500" : "bg-purple-600"
                    }`}>
                    {message.role === "user" ? <User className="w-5 h-5 text-white" /> : <Bot className="w-5 h-5 text-white" />}
                  </div>

                  <div
                    className={`max-w-[85%] rounded-2xl px-5 py-3 text-sm leading-relaxed shadow-md ${message.role === "user"
                      ? "bg-emerald-600 text-white rounded-tr-none"
                      : "bg-slate-800/80 text-slate-200 border border-slate-700 rounded-tl-none"
                      }`}
                  >
                    {message.role === "assistant" ? (
                      <div className="prose prose-invert prose-sm max-w-none">
                        <ReactMarkdown
                          components={{
                            p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                            ul: ({ children }) => <ul className="list-disc pl-4 mb-2">{children}</ul>,
                            ol: ({ children }) => <ol className="list-decimal pl-4 mb-2">{children}</ol>,
                            li: ({ children }) => <li className="mb-1">{children}</li>,
                            strong: ({ children }) => <span className="font-bold text-white">{children}</span>,
                          }}
                        >
                          {message.content}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      message.content
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-4"
              >
                <div className="shrink-0 w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="bg-slate-800/50 rounded-2xl rounded-tl-none px-5 py-4 flex items-center gap-2">
                  <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </motion.div>
            )}
          </div>

          <div className="p-4 bg-slate-900/50 border-t border-white/5">
            <form onSubmit={handleSubmit} className="flex gap-3 relative">
              <Input
                placeholder="Type your health question..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="pr-12 bg-slate-950/50 border-slate-700 focus:border-purple-500/50 focus:ring-purple-500/20"
                disabled={loading}
              />
              <Button
                type="submit"
                disabled={loading || !input.trim()}
                size="icon"
                className="absolute right-1 top-1 h-8 w-8 bg-purple-600 hover:bg-purple-700"
              >
                <Send className="w-4 h-4" />
              </Button>
            </form>
            <div className="mt-2">
              <VoiceInput
                label="Voice Input"
                placeholder="Tap to speak..."
                onTranscript={(text) => {
                  setInput(text);
                  void sendMessage(text);
                }}
              />
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="glass-card p-6 flex flex-col gap-6 h-fit">
          <div>
            <div className="flex items-center gap-2 mb-3 text-purple-400">
              <Sparkles className="w-4 h-4" />
              <p className="font-semibold text-xs uppercase tracking-wider">
                Latest Insights
              </p>
            </div>
            <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 text-sm text-purple-100 italic">
              "{insights.slice(0, 150)}{insights.length > 150 ? "..." : ""}"
            </div>
          </div>

          <div className="space-y-3">
            <p className="font-semibold text-xs uppercase tracking-wider text-slate-400">
              Suggested Prompts
            </p>
            <div className="flex flex-col gap-2">
              {[
                "Explain my latest blood test results",
                "What are side effects of Amoxicillin?",
                "Give me a 5-minute desk workout",
                "Healthy dinner ideas for high cholesterol"
              ].map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  className="text-left px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 hover:border-purple-500/50 hover:bg-purple-500/10 transition-all text-sm text-slate-300 hover:text-white group"
                  onClick={() => {
                    setInput(prompt);
                    void sendMessage(prompt);
                  }}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-auto pt-6 border-t border-white/5 text-xs text-slate-500 text-center">
            AI can make mistakes. Please verify important medical information with a doctor.
          </div>
        </div>
      </div>
    </div>
  );
}

