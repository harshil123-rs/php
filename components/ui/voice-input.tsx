"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

type VoiceInputProps = {
  label?: string;
  placeholder?: string;
  onTranscript: (text: string) => void;
};

export function VoiceInput({
  label = "Voice capture",
  placeholder = "Use your voice to fill this field...",
  onTranscript
}: VoiceInputProps) {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [preview, setPreview] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const SR =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition ||
      (window as any).mozSpeechRecognition ||
      (window as any).msSpeechRecognition;
    setSupported(!!SR);
  }, []);

  const handleStart = () => {
    if (!supported || typeof window === "undefined") return;

    const SR =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition ||
      (window as any).mozSpeechRecognition ||
      (window as any).msSpeechRecognition;

    const recognition = new SR();
    recognition.lang = "en-US";
    recognition.interimResults = true;
    recognition.continuous = false;

    setListening(true);
    setPreview("");

    recognition.onresult = (event: any) => {
      let text = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        text += event.results[i][0].transcript;
      }
      setPreview(text);
    };

    recognition.onerror = () => {
      setListening(false);
      recognition.stop();
    };

    recognition.onend = () => {
      setListening(false);
      if (preview.trim()) {
        onTranscript(preview.trim());
      }
    };

    recognition.start();
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs text-muted uppercase tracking-[0.25em]">
            {label}
          </p>
          {!supported && (
            <p className="text-[11px] text-red-400 mt-1">
              Voice input not supported in this browser.
            </p>
          )}
        </div>
        <Button
          type="button"
          size="sm"
          variant={listening ? "danger" : "outline"}
          className="flex items-center gap-1 text-xs"
          disabled={!supported}
          onClick={handleStart}
        >
          <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
          {listening ? "Listening..." : "Speak"}
        </Button>
      </div>
      <div className="h-10 rounded-lg border border-card-border/60 bg-slate-900/60 px-3 flex items-center text-xs text-muted">
        {preview || placeholder}
      </div>
    </div>
  );
}


