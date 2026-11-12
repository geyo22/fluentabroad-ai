"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Mic, MicOff, Volume2, VolumeX, AlertCircle } from "lucide-react";

// Web Speech API Types
interface SpeechRecognitionEventLike {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
      isFinal: boolean;
    };
    length: number;
  };
}

interface SpeechRecognitionErrorEventLike {
  error: string;
}

interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onstart: () => void;
  onend: () => void;
  onresult: (event: SpeechRecognitionEventLike) => void;
  onerror: (event: SpeechRecognitionErrorEventLike) => void;
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;

interface WindowWithSpeech extends Window {
  SpeechRecognition?: SpeechRecognitionConstructor;
  webkitSpeechRecognition?: SpeechRecognitionConstructor;
}

/**
 * Text-to-Speech (TTS) helper hook
 */
export function useTextToSpeech() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [isSupported, setIsSupported] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      setIsSupported(true);
    }
  }, []);

  const speak = useCallback(
    (text: string, speed?: number, onFinish?: () => void) => {
      if (!isSupported || typeof window === "undefined") return;

      window.speechSynthesis.cancel(); // Stop any ongoing speech

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      utterance.rate = speed !== undefined ? speed : playbackSpeed;

      // Select natural English voice if available
      const voices = window.speechSynthesis.getVoices();
      const naturalVoice = voices.find(
        (v) =>
          (v.lang.startsWith("en-US") || v.lang.startsWith("en-GB") || v.lang.startsWith("en-AU")) &&
          (v.name.includes("Natural") || v.name.includes("Google") || v.name.includes("Premium") || v.name.includes("Samantha"))
      ) || voices.find((v) => v.lang.startsWith("en"));

      if (naturalVoice) utterance.voice = naturalVoice;

      utterance.onstart = () => setIsPlaying(true);
      utterance.onend = () => {
        setIsPlaying(false);
        if (onFinish) onFinish();
      };
      utterance.onerror = () => setIsPlaying(false);

      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    },
    [isSupported, playbackSpeed]
  );

  const stop = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    }
  }, []);

  return {
    speak,
    stop,
    isPlaying,
    playbackSpeed,
    setPlaybackSpeed,
    isSupported,
  };
}

/**
 * Speech-to-Text (STT) Hook using Web Speech API with fallback
 */
export function useSpeechRecognition({
  onTranscriptChange,
  onFinalTranscript,
  lang = "en-US",
}: {
  onTranscriptChange?: (text: string) => void;
  onFinalTranscript?: (text: string) => void;
  lang?: string;
}) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isSupported, setIsSupported] = useState(true);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const win = window as unknown as WindowWithSpeech;
    const SpeechRecognitionClass = win.SpeechRecognition || win.webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      setIsSupported(false);
      return;
    }

    try {
      const recognition = new SpeechRecognitionClass();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = lang;

      recognition.onstart = () => {
        setIsListening(true);
        setPermissionError(null);
      };

      recognition.onresult = (event: SpeechRecognitionEventLike) => {
        let interim = "";
        let final = "";

        for (let i = 0; i < event.results.length; i++) {
          const item = event.results[i];
          const text = item[0].transcript;
          if (item.isFinal) {
            final += text + " ";
          } else {
            interim += text;
          }
        }

        const currentText = (final + interim).trim();
        setTranscript(currentText);
        if (onTranscriptChange) onTranscriptChange(currentText);
        if (final && onFinalTranscript) onFinalTranscript(final.trim());
      };

      recognition.onerror = (event: SpeechRecognitionErrorEventLike) => {
        console.warn("Speech recognition error:", event.error);
        if (event.error === "not-allowed" || event.error === "permission-denied") {
          setPermissionError("Izin mikrofon ditolak oleh browser. Mohon izinkan mikrofon atau gunakan input teks.");
        } else if (event.error === "no-speech") {
          // Normal timeout, no action required
        } else {
          setPermissionError(`Perekaman suara: ${event.error}`);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } catch (e) {
      console.error("Failed to initialize Speech Recognition:", e);
      setIsSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
    };
  }, [lang, onFinalTranscript, onTranscriptChange]);

  const startListening = useCallback(() => {
    setTranscript("");
    setPermissionError(null);
    if (!recognitionRef.current) {
      setIsSupported(false);
      return;
    }
    try {
      recognitionRef.current.start();
    } catch {
      // In case start is called while already active
      try {
        recognitionRef.current.stop();
        recognitionRef.current.start();
      } catch (err) {
        console.error("Error starting speech recognition:", err);
      }
    }
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.error("Error stopping speech recognition:", e);
      }
    }
    setIsListening(false);
  }, [isListening]);

  return {
    isListening,
    transcript,
    setTranscript,
    startListening,
    stopListening,
    isSupported,
    permissionError,
  };
}

/**
 * Word-Recognition Similarity & Transcript Comparison Utility for Shadowing Practice
 * Note: Clearly labeled as word-recognition similarity, NOT fake acoustic phoneme score.
 */
export function compareTranscriptToTarget(
  spokenText: string,
  targetText: string
): {
  similarityScore: number; // 0-100%
  wordComparison: { word: string; matched: boolean }[];
  feedbackNotes: string;
} {
  const normalize = (s: string) =>
    s
      .toLowerCase()
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"']/g, "")
      .trim();

  const targetWords = normalize(targetText).split(/\s+/).filter(Boolean);
  const spokenWords = normalize(spokenText).split(/\s+/).filter(Boolean);

  if (targetWords.length === 0) {
    return { similarityScore: 0, wordComparison: [], feedbackNotes: "No target sentence provided." };
  }

  let matchedCount = 0;
  const wordComparison = targetWords.map((word) => {
    const matched = spokenWords.includes(word);
    if (matched) matchedCount++;
    return { word, matched };
  });

  const similarityScore = Math.round((matchedCount / targetWords.length) * 100);

  let feedbackNotes = "";
  if (similarityScore >= 90) {
    feedbackNotes = "Luar biasa! Pengenalan kata sangat akurat dan mendekati kalimat target secara sempurna.";
  } else if (similarityScore >= 70) {
    feedbackNotes = "Bagus! Sebagian besar kata tertangkap dengan jelas. Perhatikan kata-kata yang ditandai merah.";
  } else if (similarityScore >= 40) {
    feedbackNotes = "Cukup baik. Coba bicarakan dengan intonasi lebih santai dan beri penekanan pada kata kunci.";
  } else {
    feedbackNotes = "Transkrip suara belum banyak cocok. Coba dengarkan audio sekali lagi lalu tirukan dengan ritme yang sama.";
  }

  return {
    similarityScore,
    wordComparison,
    feedbackNotes,
  };
}

/**
 * Interactive Speech Player Button Component
 */
export function SpeakButton({
  text,
  rate = 1.0,
  className = "",
  size = "md",
}: {
  text: string;
  rate?: number;
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const { speak, stop, isPlaying, isSupported } = useTextToSpeech();

  if (!isSupported) {
    return (
      <span className="text-xs text-muted-foreground flex items-center gap-1" title="Browser TTS not available">
        <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
      </span>
    );
  }

  const sizeClasses =
    size === "sm" ? "p-1.5 text-xs" : size === "lg" ? "p-3 text-base" : "p-2 text-sm";

  return (
    <button
      type="button"
      onClick={() => (isPlaying ? stop() : speak(text, rate))}
      aria-label={isPlaying ? "Stop audio" : "Play English audio"}
      className={`inline-flex items-center justify-center rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-primary/40 ${
        isPlaying
          ? "bg-primary text-white shadow-md animate-pulse"
          : "bg-primary/10 text-primary hover:bg-primary/20"
      } ${sizeClasses} ${className}`}
    >
      {isPlaying ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
    </button>
  );
}

