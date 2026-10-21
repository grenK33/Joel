import { GoogleGenAI, Modality } from '@google/genai';
import { JOEL_SYSTEM_INSTRUCTION } from './_shared.js';

const LIVE_MODEL = 'gemini-3.8-live';

// Mints a short-lived, single-use Gemini Live token so the browser can open the
// voice session directly (Vercel functions cannot hold a WebSocket open).
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY is missing on server.' });
  }

  try {
    const ai = new GoogleGenAI({ apiKey, httpOptions: { apiVersion: 'v1alpha' } });
    const now = Date.now();
    const token = await ai.authTokens.create({
      config: {
        uses: 1,
        expireTime: new Date(now + 30 * 60 * 1000).toISOString(),
        newSessionExpireTime: new Date(now + 60 * 1000).toISOString(),
        liveConnectConstraints: {
          model: LIVE_MODEL,
          config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Fenrir' } } },
            systemInstruction:
              JOEL_SYSTEM_INSTRUCTION + '\nKeep spoken voice replies concise, warm, and articulate.',
          },
        },
        httpOptions: { apiVersion: 'v1alpha' },
      },
    });
    return res.json({ token: token.name, model: LIVE_MODEL });
  } catch (err: any) {
    console.error('Failed to create live token:', err?.message || err);
    return res.status(500).json({ error: 'Could not start a live voice session.' });
  }
}
