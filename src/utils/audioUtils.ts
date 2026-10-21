/**
 * Audio processing utilities for Gemini Live API (16kHz in, 24kHz out)
 * and TTS audio playback.
 */

// Convert Float32Array from AudioContext to 16-bit PCM Base64
export function floatTo16BitPCMBase64(input: Float32Array): string {
  const output = new Int16Array(input.length);
  for (let i = 0; i < input.length; i++) {
    const s = Math.max(-1, Math.min(1, input[i]));
    output[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
  let binary = '';
  const bytes = new Uint8Array(output.buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Convert Base64 16-bit PCM (24kHz) to Float32Array for AudioBuffer
export function base64PCMToFloat32(base64: string): Float32Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  const int16 = new Int16Array(bytes.buffer);
  const float32 = new Float32Array(int16.length);
  for (let i = 0; i < int16.length; i++) {
    float32[i] = int16[i] / (int16[i] < 0 ? 0x8000 : 0x7fff);
  }
  return float32;
}

// Gapless PCM Audio Stream Player for Live API
export class GaplessPCMPlayer {
  private audioCtx: AudioContext | null = null;
  private nextStartTime = 0;
  private isPlaying = false;
  private sampleRate = 24000;
  private scheduledNodes: AudioBufferSourceNode[] = [];

  constructor(sampleRate = 24000) {
    this.sampleRate = sampleRate;
  }

  private ensureContext(): AudioContext {
    if (!this.audioCtx || this.audioCtx.state === 'closed') {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioCtx = new AudioCtxClass({ sampleRate: this.sampleRate });
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  public playChunk(base64PCM: string) {
    try {
      const ctx = this.ensureContext();
      const float32Data = base64PCMToFloat32(base64PCM);
      if (float32Data.length === 0) return;

      const audioBuffer = ctx.createBuffer(1, float32Data.length, this.sampleRate);
      audioBuffer.getChannelData(0).set(float32Data);

      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);

      const currentTime = ctx.currentTime;
      // If we fell behind or starting fresh, schedule immediately with slight buffer
      if (this.nextStartTime < currentTime) {
        this.nextStartTime = currentTime + 0.05;
      }

      source.start(this.nextStartTime);
      this.nextStartTime += audioBuffer.duration;
      this.isPlaying = true;
      this.scheduledNodes.push(source);

      source.onended = () => {
        const index = this.scheduledNodes.indexOf(source);
        if (index > -1) {
          this.scheduledNodes.splice(index, 1);
        }
        if (this.scheduledNodes.length === 0) {
          this.isPlaying = false;
        }
      };
    } catch (e) {
      console.error('Error playing PCM audio chunk:', e);
    }
  }

  public stop() {
    this.scheduledNodes.forEach((node) => {
      try {
        node.stop();
        node.disconnect();
      } catch {
        // ignore already stopped nodes
      }
    });
    this.scheduledNodes = [];
    if (this.audioCtx) {
      this.nextStartTime = this.audioCtx.currentTime;
    }
    this.isPlaying = false;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }
}

// Play regular WAV base64 audio (from TTS)
export function playWavBase64(base64Wav: string): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const audio = new Audio(`data:audio/wav;base64,${base64Wav}`);
      audio.onended = () => resolve();
      audio.onerror = (e) => reject(e);
      audio.play().catch(reject);
    } catch (e) {
      reject(e);
    }
  });
}
