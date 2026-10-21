import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Mic,
  MicOff,
  Radio,
  Volume2,
  VolumeX,
  PhoneOff,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  RefreshCw,
  MessageSquare
} from 'lucide-react';
import { GoogleGenAI, type LiveServerMessage, type Session } from '@google/genai';
import { GaplessPCMPlayer, floatTo16BitPCMBase64, playWavBase64 } from '../utils/audioUtils';
import { INITIAL_GREETING, GREN_PROFILE } from '../data/grenResumeData';

interface LiveVoiceViewProps {
  isVoiceActive: boolean;
  setIsVoiceActive: (active: boolean) => void;
  onSwitchToChat: (prefilledQuestion?: string) => void;
}

export const LiveVoiceView: React.FC<LiveVoiceViewProps> = ({
  isVoiceActive,
  setIsVoiceActive,
  onSwitchToChat,
}) => {
  const [connectionStatus, setConnectionStatus] = useState<
    'idle' | 'connecting' | 'connected' | 'speaking' | 'listening' | 'error'
  >('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [transcriptLog, setTranscriptLog] = useState<Array<{ sender: 'Joel' | 'You'; text: string }>>([
    { sender: 'Joel', text: INITIAL_GREETING }
  ]);
  const [audioLevel, setAudioLevel] = useState<number>(0);

  // References for Live session, AudioContext, Stream, and Player
  const sessionRef = useRef<Session | null>(null);
  const pcmPlayerRef = useRef<GaplessPCMPlayer | null>(null);
  const inputAudioCtxRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const isMutedRef = useRef(false);
  const animationFrameRef = useRef<number | null>(null);

  isMutedRef.current = isMuted;

  // Initialize PCM Player on mount
  useEffect(() => {
    pcmPlayerRef.current = new GaplessPCMPlayer(24000);
    return () => {
      cleanupAudioSession();
    };
  }, []);

  const cleanupAudioSession = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (scriptProcessorRef.current) {
      try {
        scriptProcessorRef.current.disconnect();
      } catch {
        // ignore
      }
      scriptProcessorRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (inputAudioCtxRef.current && inputAudioCtxRef.current.state !== 'closed') {
      try {
        inputAudioCtxRef.current.close();
      } catch {
        // ignore
      }
      inputAudioCtxRef.current = null;
    }
    if (sessionRef.current) {
      try {
        sessionRef.current.close();
      } catch {
        // ignore
      }
      sessionRef.current = null;
    }
    if (pcmPlayerRef.current) {
      pcmPlayerRef.current.stop();
    }
    setConnectionStatus('idle');
    setAudioLevel(0);
    setIsVoiceActive(false);
  }, [setIsVoiceActive]);

  // Start Live Voice Session
  const startLiveSession = async () => {
    setErrorMessage(null);
    setConnectionStatus('connecting');

    try {
      // 1. Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      mediaStreamRef.current = stream;

      // 2. Set up Input AudioContext (16kHz for Gemini Live API)
      const AudioCtxClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const inputCtx = new AudioCtxClass({ sampleRate: 16000 });
      inputAudioCtxRef.current = inputCtx;

      const source = inputCtx.createMediaStreamSource(stream);
      const processor = inputCtx.createScriptProcessor(4096, 1, 1);
      scriptProcessorRef.current = processor;

      // Analyzer for visualizer
      const analyser = inputCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);

      // Animation for mic volume levels
      const updateVisualizer = () => {
        if (!mediaStreamRef.current) return;
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        setAudioLevel(Math.min(100, Math.round((avg / 128) * 100)));
        animationFrameRef.current = requestAnimationFrame(updateVisualizer);
      };
      updateVisualizer();

      // 3. Get a short-lived token from our API, then open the Live session directly
      const tokenRes = await fetch('/api/live-token', { method: 'POST' });
      if (!tokenRes.ok) {
        const body = await tokenRes.json().catch(() => ({}));
        throw new Error(body.error || `Token request failed (${tokenRes.status})`);
      }
      const { token, model } = await tokenRes.json();

      const ai = new GoogleGenAI({ apiKey: token, httpOptions: { apiVersion: 'v1alpha' } });
      let open = false;
      const session = await ai.live.connect({
        model,
        callbacks: {
          onopen: () => {
            open = true;
            setConnectionStatus('listening');
            setIsVoiceActive(true);
            speakGreetingAloud();
          },
          onmessage: (message: LiveServerMessage) => {
            const audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (audio) {
              setConnectionStatus('speaking');
              pcmPlayerRef.current?.playChunk(audio);
            }
            if (message.serverContent?.interrupted) {
              pcmPlayerRef.current?.stop();
              setConnectionStatus('listening');
            }
            if (message.serverContent?.turnComplete) {
              setConnectionStatus('listening');
            }
          },
          onerror: (e: ErrorEvent) => {
            console.error('Gemini Live API error:', e);
            setErrorMessage(e.message || 'Error occurred with Gemini Live API');
            setConnectionStatus('error');
          },
          onclose: () => {
            if (open) {
              open = false;
              setConnectionStatus((s) => (s === 'error' ? s : 'idle'));
              setIsVoiceActive(false);
            }
          },
        },
      });
      sessionRef.current = session;

      // 4. Capture audio and send to Live API
      processor.onaudioprocess = (e) => {
        if (isMutedRef.current || !open) return;

        const inputBuffer = e.inputBuffer.getChannelData(0);
        const base64PCM = floatTo16BitPCMBase64(inputBuffer);
        session.sendRealtimeInput({ audio: { data: base64PCM, mimeType: 'audio/pcm;rate=16000' } });
      };

      source.connect(processor);
      processor.connect(inputCtx.destination);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('Microphone or connection failure:', msg);
      setErrorMessage(`Microphone access failed: ${msg}. Please allow microphone permissions.`);
      setConnectionStatus('error');
      setIsVoiceActive(false);
    }
  };

  const speakGreetingAloud = async () => {
    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: INITIAL_GREETING, voice: 'Fenrir' }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.audio) {
          await playWavBase64(data.audio);
        }
      }
    } catch (e) {
      console.log('Spoken greeting playback error:', e);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[600px] text-center space-y-8">
      {/* Status Badge */}
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-300">
        <span
          className={`w-2.5 h-2.5 rounded-full ${
            connectionStatus === 'connected' || connectionStatus === 'listening'
              ? 'bg-emerald-400 animate-pulse'
              : connectionStatus === 'speaking'
              ? 'bg-amber-400 animate-ping'
              : connectionStatus === 'connecting'
              ? 'bg-indigo-400 animate-pulse'
              : 'bg-slate-600'
          }`}
        />
        <span className="font-medium">
          {connectionStatus === 'idle' && 'Voice Session Inactive'}
          {connectionStatus === 'connecting' && 'Connecting to Gemini 3.8 Live API...'}
          {connectionStatus === 'connected' && 'Live Audio Stream Connected'}
          {connectionStatus === 'listening' && 'Listening to you...'}
          {connectionStatus === 'speaking' && 'Joel is speaking...'}
          {connectionStatus === 'error' && 'Connection Issue'}
        </span>
        <span className="text-slate-600">|</span>
        <span className="text-indigo-400 font-semibold">gemini-3.8-live</span>
      </div>

      {/* Main Orb / Visualizer */}
      <div className="relative flex items-center justify-center">
        {/* Outer ambient glow rings */}
        <div
          className={`absolute rounded-full transition-all duration-300 pointer-events-none ${
            connectionStatus === 'speaking'
              ? 'w-72 h-72 bg-amber-500/20 blur-2xl scale-125'
              : connectionStatus === 'listening'
              ? 'w-72 h-72 bg-emerald-500/20 blur-2xl scale-110'
              : 'w-60 h-60 bg-indigo-500/10 blur-xl scale-100'
          }`}
          style={{
            transform: `scale(${1 + (audioLevel / 100) * 0.4})`,
          }}
        />

        {/* Pulsing ring */}
        <div
          className={`w-52 h-52 rounded-full border-2 transition-all flex items-center justify-center p-3 relative z-10 ${
            connectionStatus === 'speaking'
              ? 'border-amber-400/60 shadow-[0_0_50px_rgba(245,158,11,0.3)] bg-gradient-to-tr from-amber-950/40 to-slate-950'
              : connectionStatus === 'listening'
              ? 'border-emerald-400/60 shadow-[0_0_50px_rgba(16,185,129,0.3)] bg-gradient-to-tr from-emerald-950/40 to-slate-950'
              : 'border-slate-800 bg-slate-900/90 shadow-2xl'
          }`}
        >
          {/* Inner core */}
          <div
            className={`w-36 h-36 rounded-full flex flex-col items-center justify-center transition-all duration-200 ${
              connectionStatus === 'speaking'
                ? 'bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-300 text-slate-950 shadow-lg'
                : connectionStatus === 'listening'
                ? 'bg-gradient-to-tr from-emerald-500 via-teal-500 to-emerald-300 text-slate-950 shadow-lg'
                : 'bg-gradient-to-tr from-indigo-900/80 via-slate-800 to-slate-900 text-slate-200 border border-slate-700'
            }`}
            style={{
              transform: `scale(${0.95 + (audioLevel / 100) * 0.25})`,
            }}
          >
            {connectionStatus === 'speaking' ? (
              <>
                <Volume2 className="w-10 h-10 animate-bounce" />
                <span className="text-[10px] font-bold uppercase tracking-wider mt-1">Speaking</span>
              </>
            ) : connectionStatus === 'listening' ? (
              <>
                <Mic className="w-10 h-10 animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-wider mt-1">Listening</span>
              </>
            ) : connectionStatus === 'connecting' ? (
              <>
                <RefreshCw className="w-8 h-8 animate-spin text-indigo-400" />
                <span className="text-[10px] font-medium text-indigo-300 mt-2">Connecting...</span>
              </>
            ) : (
              <>
                <Mic className="w-10 h-10 text-slate-400" />
                <span className="text-[10px] font-medium text-slate-400 mt-1">Tap To Start</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Greeting Display & Dialogue Subtitle */}
      <div className="max-w-xl mx-auto space-y-2">
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg">
          <div className="flex items-center justify-center gap-1.5 text-xs text-amber-400 font-semibold mb-1">
            <Sparkles className="w-3.5 h-3.5" /> Joel&apos;s Greeting
          </div>
          <p className="text-base font-medium text-slate-100 italic">
            &ldquo;{INITIAL_GREETING}&rdquo;
          </p>
        </div>
        <p className="text-xs text-slate-400">
          Strictly grounded in Gren&apos;s authenticated Perception Audit (Oct 5, 2026).
        </p>
      </div>

      {/* Error Notice */}
      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-900/50 text-rose-300 text-xs flex items-center gap-2 max-w-md mx-auto">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Action Controls */}
      <div className="flex flex-wrap items-center justify-center gap-4">
        {connectionStatus === 'idle' || connectionStatus === 'error' ? (
          <button
            onClick={startLiveSession}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-bold text-sm shadow-xl shadow-amber-500/20 flex items-center gap-2.5 transition-all transform hover:scale-105 active:scale-95"
          >
            <Radio className="w-4 h-4" />
            <span>Start Live Voice Conversation</span>
          </button>
        ) : (
          <>
            <button
              onClick={toggleMute}
              className={`p-3.5 rounded-xl border transition-all ${
                isMuted
                  ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                  : 'bg-slate-800/80 border-slate-700 text-slate-200 hover:bg-slate-700'
              }`}
              title={isMuted ? 'Unmute Microphone' : 'Mute Microphone'}
            >
              {isMuted ? <MicOff className="w-5 h-5 text-rose-400" /> : <Mic className="w-5 h-5 text-emerald-400" />}
            </button>

            <button
              onClick={cleanupAudioSession}
              className="px-5 py-3 rounded-xl bg-rose-600/90 hover:bg-rose-600 text-white font-semibold text-sm shadow-lg shadow-rose-900/30 flex items-center gap-2 transition-all"
            >
              <PhoneOff className="w-4 h-4" />
              <span>End Voice Call</span>
            </button>
          </>
        )}

        <button
          onClick={() => onSwitchToChat()}
          className="px-4 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-sm font-medium flex items-center gap-2 transition-all"
        >
          <MessageSquare className="w-4 h-4 text-amber-400" />
          <span>Switch to Text Chat</span>
        </button>
      </div>

      {/* Quick Spoken Prompts Guide */}
      <div className="pt-4 border-t border-slate-800/80 max-w-2xl w-full">
        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
          Suggested questions to ask Joel out loud:
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
          {GREN_PROFILE.suggestedQuestions.slice(0, 4).map((q, idx) => (
            <div
              key={idx}
              onClick={() => {
                if (connectionStatus === 'connected' || connectionStatus === 'listening') {
                  // If connected, send text over the live session
                  sessionRef.current?.sendRealtimeInput({ text: q });
                } else {
                  onSwitchToChat(q);
                }
              }}
              className="p-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-800/60 border border-slate-800 text-xs text-slate-300 hover:text-amber-300 cursor-pointer transition-all flex items-center justify-between group"
            >
              <span>&ldquo;{q}&rdquo;</span>
              <Sparkles className="w-3 h-3 text-slate-600 group-hover:text-amber-400 shrink-0 ml-1.5" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
