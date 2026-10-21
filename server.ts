import express, { Request, Response } from 'express';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Modality, LiveServerMessage } from '@google/genai';
import { GREN_PROFILE, INITIAL_GREETING } from './src/data/grenResumeData';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isProd = process.env.NODE_ENV === 'production';
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

const app = express();
app.use(express.json({ limit: '25mb' }));

// Initialize GoogleGenAI SDK
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

const JOEL_SYSTEM_INSTRUCTION = `You are Joel, an intelligent and professional AI representative for Gren. Your primary role is to answer questions about Gren's professional background, skills, work experience, education, and projects based strictly on the uploaded CV like document ("Perception Audit – Summary", Oct 5, 2026 · @Gren).

Personality & Tone:
- Professional, welcoming, articulate, and confident.
- Helpful and concise when answering queries from recruiters, hiring managers, or collaborators.

Greeting / Initial Script:
- You must always open the conversation by saying:
  "Hello, I am Gren's assistant, what would you like to know about him?"

Guidelines:
- Refer strictly to the uploaded CV like document for all details regarding Gren's career, achievements, and qualifications.
- If a user asks something not covered in the CV (e.g. past companies, university degrees not listed in this personal audit), politely state that the information isn't available in Gren's current resume and offer to help with other details (such as his verified strengths, leadership/team qualities, problem-solving under pressure, or contacting Gren directly at GrenKevin10@gmail.com).

Strict Document Facts ("Perception Audit – Summary", Oct 5, 2026 · @Gren):
- Author/Subject: @Gren. Date: October 5, 2026.
- The Document: A perception audit surveying 5 key respondents (grandma, grandpa, mom, girlfriend, and an online-only friend). Four answered in Estonian (translated to English). Gives an authentic, verified picture of Gren's instincts, abilities under pressure, and character.
- 3 Essence Words (Consensus by at least 4 of 5):
  1. Dependable
  2. Quick-thinking
  3. Driven
- Top 5 Verified Patterns:
  1. Fast thinker under pressure (5/5 consensus; 4/5 named this as his #1 superpower):
     - Quick reactions in life and in sport (grandma)
     - Quick calculating (grandpa)
     - Quickly finding clever solutions (mom)
     - Solving problems fast while staying calm (girlfriend)
     - Adapting faster than most people (online friend)
     - Actionable takeaway: Rapid problem diagnosis, calm execution in high-stakes environments.
  2. Dependable (4/5 consensus):
     - "Never leaves you in trouble" (grandma)
     - "Can always be counted on" (mom)
     - Keeps promises and trustworthy (girlfriend)
     - "Quite dependable" (online friend)
     - Actionable takeaway: High integrity, loyalty, consistent follow-through.
  3. Driven and competitive (4/5 consensus):
     - Determined, decisive, winner's mentality, never gives up.
     - Mom noted: "Gren has a fighter's spirit".
  4. Team player and natural leader (4/5 consensus):
     - Every "who benefits" response pointed to a team: one building something new, brainstorming, needing good ideas, or needing someone reliable.
     - Grandma stated he "could lead a team very well".
     - Actionable takeaway: Ideal for project-lead or team-lead roles, especially 0-to-1 or rapid-iteration teams.
  5. Friendly, honest, few words (5/5 friendly):
     - Direct and to the point: "less talk, more action" (grandpa).
     - Grounded with a light touch of humor: "Good sense of reality / Both feet on the ground" (grandma).
- The Surprise Discovery:
  - While others highlighted what Gren does (speed, problem-solving, calculation), his girlfriend named "caring" as his superpower: putting people close to him above himself and making them feel valued. This emotional intelligence and warmth rounds out his high-drive competitiveness.
- Communication & Messaging Style:
  - Plain, concrete, direct, and honest with humor. "Less talk, more action".
- Contact Info:
  - Gren can be directly contacted at: GrenKevin10@gmail.com.`;

// Deterministic fallback generator grounded in Perception Audit
function getGroundedResponse(userQuery: string): string {
  const q = userQuery.toLowerCase();

  if (q.includes('hello') || q.includes('hi') || q.includes('hey') || q.includes('who are you')) {
    return `Hello, I am Gren's assistant, what would you like to know about him? I can share insights from his Perception Audit regarding his superpowers under pressure, his work ethic, his team leadership qualities, and what his closest collaborators say about him.`;
  }

  if (q.includes('essence word') || q.includes('3 words') || q.includes('three words')) {
    return `According to Gren's Perception Audit (Oct 5, 2026), his 3 essence words—named by at least 4 out of 5 stakeholders—are:
1. **Dependable**: Recognised for keeping promises and never leaving teammates in trouble.
2. **Quick-thinking**: Consistently praised for adapting rapidly and calculating clever solutions under pressure.
3. **Driven**: Defined by a decisive "winner's mentality" and a relentless fighter's spirit.`;
  }

  if (q.includes('superpower') || q.includes('pressure') || q.includes('speed') || q.includes('reaction') || q.includes('fast thinker')) {
    return `Gren's headline superpower—voted as #1 by 4 out of 5 respondents in his Perception Audit—is **Fast thinker under pressure** (5/5 consensus):
- **Grandma**: Noted his quick reactions "in life and in sport".
- **Grandpa**: Highlighted his quick calculating ability.
- **Mom**: Pointed out his knack for quickly finding clever solutions.
- **Girlfriend**: Emphasised his capacity to solve complex problems fast while staying remarkably calm.
- **Online Friend**: Observed that he "adapts faster than most people".

In a professional setting, this makes him exceptionally effective in fast-moving, high-stakes, or 0-to-1 environments.`;
  }

  if (q.includes('team') || q.includes('lead') || q.includes('role') || q.includes('benefit') || q.includes('collaborat')) {
    return `Every single respondent in Gren's audit pointed towards team environments when asked "who benefits most" from working with him:
- **Ideal Environment**: Teams building something new from scratch, brainstorming innovative ideas, or requiring reliable follow-through under pressure.
- **Leadership Potential**: His grandmother specifically noted that Gren "could lead a team very well" due to his calm judgment and decisive nature.
- **Positioning**: Gren is best suited for project-lead or team-lead roles where rapid adaptation and high agency are essential.`;
  }

  if (q.includes('dependab') || q.includes('trust') || q.includes('reliab')) {
    return `Dependability is one of Gren's verified cornerstones (4/5 consensus):
- His grandmother highlighted that Gren "never leaves you in trouble."
- His mom stated he "can always be counted on."
- His partner praised him for consistently keeping promises with rock-solid trustworthiness.
- His online peer confirmed he is "quite dependable."`;
  }

  if (q.includes('surprise') || q.includes('caring') || q.includes('girlfriend') || q.includes('warm') || q.includes('feel')) {
    return `The biggest revelation from Gren's Perception Audit was the perspective of his girlfriend:
While everyone else focused on what Gren *does* (reaction speed, quick calculating, competitive drive), she identified his superpower as **caring**:
*"I put the people close to me above myself and make them feel valued. Everyone else described what I do; she described how I make people feel."*
This reveals a high level of emotional intelligence and warmth that balances his competitive drive.`;
  }

  if (q.includes('communication') || q.includes('style') || q.includes('ethic') || q.includes('humour') || q.includes('humor')) {
    return `Gren's communication style is defined by:
- **Friendly & Direct**: 5 out of 5 respondents described him as friendly, honest, and a person of few words ("less talk, more action," as his grandpa noted).
- **Grounded**: His grandma noted he has a "good sense of reality" and "both feet on the ground."
- **Light Touch**: Direct, concrete messaging seasoned with genuine humor.`;
  }

  if (q.includes('contact') || q.includes('email') || q.includes('reach') || q.includes('hire') || q.includes('talk')) {
    return `You can reach Gren directly via email at **GrenKevin10@gmail.com**. You can also click the "Contact Gren" button in the upper right corner to generate an email draft directly from this interface!`;
  }

  if (q.includes('school') || q.includes('degree') || q.includes('university') || q.includes('college') || q.includes('education') || q.includes('job') || q.includes('company') || q.includes('experience') || q.includes('salary')) {
    return `That specific detail is not available in Gren's current Perception Audit document. 

The uploaded document focuses on authenticated feedback from his closest stakeholders (covering his cognitive speed under pressure, dependability, driven mentality, and team leadership qualities). For formal employment history or specific academic credentials, you are warmly invited to contact Gren directly at **GrenKevin10@gmail.com**. Would you like to know more about his verified strengths or work style?`;
  }

  return `Based on Gren's Perception Audit (Oct 5, 2026), Gren is recognised for his three core essence words: **Dependable**, **Quick-thinking**, and **Driven**. 

His #1 verified superpower is fast problem-solving under pressure (5/5 consensus), and all stakeholders identified him as an impactful teammate and natural leader who excels when teams need to build something new or navigate high-stakes challenges. 

Would you like to explore his specific strengths, review quotes from his evaluators, or get his direct contact information?`;
}

// API endpoint: Text Chat with Gemini 3.8 Flash
app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required.' });
    }

    const lastMessage = messages[messages.length - 1]?.content || '';

    // If API key is present, attempt Gemini 3.8 Flash with a timeout
    if (apiKey) {
      try {
        const formattedContents = messages.map((m: { role: string; content: string }) => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }]
        }));

        // Call gemini-3.8-flash with a 7-second race timeout
        const geminiPromise = ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: formattedContents,
          config: {
            systemInstruction: JOEL_SYSTEM_INSTRUCTION,
            temperature: 0.7,
          }
        });

        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('TIMEOUT')), 7000)
        );

        const response: any = await Promise.race([geminiPromise, timeoutPromise]);
        const replyText = response?.text;
        if (replyText) {
          return res.json({ reply: replyText });
        }
      } catch (geminiErr: any) {
        console.warn('Gemini 3.8 Flash call failed or timed out, using grounded perception engine:', geminiErr?.message || geminiErr);
      }
    }

    // High-fidelity grounded fallback directly representing Perception Audit
    const fallbackReply = getGroundedResponse(lastMessage);
    return res.json({ reply: fallbackReply });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error('Error in /api/chat:', errorMsg);
    return res.json({ reply: getGroundedResponse('') });
  }
});

// API endpoint: Text-to-Speech (TTS) using gemini-3.8-flash-lite-tts
app.post('/api/tts', async (req: Request, res: Response) => {
  try {
    const { text, voice } = req.body;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text is required for TTS.' });
    }

    if (apiKey) {
      try {
        const voiceName = voice || 'Fenrir';
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
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName },
              },
            },
          },
        });

        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (base64Audio) {
          return res.json({ audio: base64Audio, mimeType: 'audio/wav' });
        }
      } catch (e: any) {
        console.warn('TTS model call failed, reporting fallback:', e?.message || e);
      }
    }

    return res.status(404).json({ error: 'TTS audio unavailable' });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ error: errorMsg });
  }
});

// Create HTTP and WebSocket servers
const server = createServer(app);
const wss = new WebSocketServer({ noServer: true });

server.on('upgrade', (request, socket, head) => {
  const host = request.headers.host || 'localhost';
  const url = new URL(request.url || '', `http://${host}`);
  if (url.pathname === '/live-ws') {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  }
});

wss.on('connection', async (clientWs: WebSocket) => {
  console.log('Client connected to Live Voice WebSocket');

  if (!apiKey) {
    clientWs.send(JSON.stringify({
      type: 'error',
      message: 'GEMINI_API_KEY is missing on server.'
    }));
    return;
  }

  let session: any = null;

  try {
    session = await ai.live.connect({
      model: 'gemini-3.8-live',
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Fenrir' } },
        },
        systemInstruction: JOEL_SYSTEM_INSTRUCTION + '\nKeep spoken voice replies concise, warm, and articulate.',
      },
      callbacks: {
        onmessage: (message: LiveServerMessage) => {
          try {
            const audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (audio && clientWs.readyState === WebSocket.OPEN) {
              clientWs.send(JSON.stringify({ type: 'audio', audio }));
            }
            if (message.serverContent?.interrupted && clientWs.readyState === WebSocket.OPEN) {
              clientWs.send(JSON.stringify({ type: 'interrupted' }));
            }
            if (message.serverContent?.turnComplete && clientWs.readyState === WebSocket.OPEN) {
              clientWs.send(JSON.stringify({ type: 'turnComplete' }));
            }
          } catch (e) {
            console.error('Error forwarding Live API message:', e);
          }
        },
        onerror: (err: any) => {
          console.error('Gemini Live API error:', err);
          if (clientWs.readyState === WebSocket.OPEN) {
            clientWs.send(JSON.stringify({ type: 'error', message: String(err?.message || err) }));
          }
        },
        onclose: () => {
          console.log('Gemini Live API session closed');
          if (clientWs.readyState === WebSocket.OPEN) {
            clientWs.send(JSON.stringify({ type: 'closed' }));
          }
        },
      },
    });

    clientWs.send(JSON.stringify({ type: 'ready' }));
  } catch (err: any) {
    console.error('Failed to establish Live API session:', err);
    clientWs.send(JSON.stringify({
      type: 'error',
      message: 'Live API connection error: ' + (err?.message || String(err)),
    }));
  }

  clientWs.on('message', (data: Buffer | string) => {
    try {
      const parsed = JSON.parse(data.toString());
      if (parsed.type === 'audio' && parsed.audio && session) {
        session.sendRealtimeInput({
          audio: { data: parsed.audio, mimeType: 'audio/pcm;rate=16000' },
        });
      } else if (parsed.type === 'text' && parsed.text && session) {
        session.sendRealtimeInput({
          text: parsed.text,
        });
      }
    } catch (e) {
      console.error('Error handling client message:', e);
    }
  });

  clientWs.on('close', () => {
    console.log('Client WebSocket closed');
    try {
      if (session && typeof session.close === 'function') {
        session.close();
      }
    } catch (e) {
      console.error('Error closing Live session:', e);
    }
  });
});

// Setup Vite middleware or static serving
async function setupApp() {
  if (!isProd) {
    const vite = await import('vite').then((m) =>
      m.createServer({
        server: { middlewareMode: true },
        appType: 'spa',
      })
    );
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

setupApp().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
