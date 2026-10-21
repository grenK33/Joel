import { GoogleGenAI } from '@google/genai';
import { JOEL_SYSTEM_INSTRUCTION, getGroundedResponse } from './_shared.js';

export const config = { maxDuration: 30 };

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  const messages = req.body?.messages;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Messages array is required.' });
  }

  const lastMessage = messages[messages.length - 1]?.content || '';
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const contents = messages.map((m: { role: string; content: string }) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }));

      const timeout = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('TIMEOUT')), 20000)
      );
      const response: any = await Promise.race([
        ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents,
          config: { systemInstruction: JOEL_SYSTEM_INSTRUCTION, temperature: 0.7 },
        }),
        timeout,
      ]);
      if (response?.text) {
        return res.json({ reply: response.text });
      }
    } catch (err: any) {
      console.warn('Gemini chat failed, using grounded fallback:', err?.message || err);
    }
  }

  return res.json({ reply: getGroundedResponse(lastMessage) });
}
