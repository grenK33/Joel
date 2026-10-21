import { GoogleGenAI, Modality } from '@google/genai';

export const config = { maxDuration: 30 };

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  const { text, voice } = req.body || {};
  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: 'Text is required for TTS.' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash-lite-tts',
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: text.slice(0, 500),
                speechMetadata: {
                  style: 'Professional, articulate, warm, and confident executive assistant',
                },
              },
            ],
          },
        ],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: voice || 'Fenrir' } },
          },
        },
      } as any);

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        return res.json({ audio: base64Audio, mimeType: 'audio/wav' });
      }
    } catch (err: any) {
      console.warn('TTS call failed:', err?.message || err);
    }
  }

  return res.status(404).json({ error: 'TTS audio unavailable' });
}
