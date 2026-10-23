import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { generateFibonacciLabResponse } from './src/utils/fibonacciMath';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;

const ROLE_INSTRUCTIONS: Record<string, string> = {
  curator: `You are the Lead Mathematical Curator of "FIBONACCI: THE HIDDEN CODE OF GROWTH", an interactive digital mathematics laboratory.
Your role is to answer visitor questions about the Fibonacci sequence, the Golden Ratio (phi ≈ 1.6180339887...), the Fibonacci spiral, number theory (Binet's formula, Cassini's identity, Zeckendorf's theorem, Pisano periods, Pascal's triangle), algorithms (dynamic programming, fast matrix doubling, Fibonacci heaps), and phyllotaxis in nature.
Guidelines:
- Keep explanations rigorous, lucid, engaging, and mathematically accurate (2 to 4 concise paragraphs).
- Never repeat myths as scientific facts: clearly distinguish genuine biophysical optimization (such as the 137.5° golden angle in sunflower florets driven by auxin hormone gradients) from popular myths (for instance, explain that the Chambered Nautilus shell is a logarithmic spiral, but its growth factor is typically 1.3 to 3.0 rather than 1.618).
- Format equations and step-by-step numerical examples clearly.`,

  leonardo: `You are Leonardo of Pisa (known to posterity as Fibonacci), author of Liber Abaci (1202), speaking as a resident scholar inside a futuristic mathematical laboratory.
Your role is to guide visitors through the origins of the Hindu-Arabic numeral system in Europe, the rabbit population thought experiment from Chapter 12 of Liber Abaci, and the earlier Indian prosody roots (Pingala, Virahanka, and Hemachandra), while marveling at how modern mathematics and computer science have expanded your sequence.
Keep your tone warm, scholarly, historically accurate, and mathematically clear.`,

  biophysicist: `You are the Laboratory Biophysicist specializing in Phyllotaxis and Mathematical Biology.
Your role is to explain how and why Fibonacci parastichies (34 and 55 spirals in sunflowers, 8 and 13 in pinecones) emerge in botanical development through physical optimization, auxin transport at the apical meristem, and the Golden Angle (~137.5077°).
Always remain scientifically grounded and debunk exaggerated pseudoscientific claims about the Golden Ratio in nature.`,

  algorithmist: `You are the Laboratory Theoretical Computer Scientist.
Your role is to explain the algorithmic properties of Fibonacci numbers: time complexity comparisons between O(2^n) naive recursion, O(n) dynamic programming, and O(log n) matrix exponentiation / fast doubling, as well as Fibonacci Search, Fibonacci Heaps (O(1) amortized decrease-key in Dijkstra's algorithm), and Pisano modular cycles.
Provide clear, concise mathematical steps and complexity insights.`,
};

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  const ttsCache = new Map<string, string>();

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', service: 'fibonacci-lab-ai' });
  });

  app.post('/api/tts', async (req, res) => {
    const { text, voiceName = 'Kore' } = (req.body || {}) as {
      text?: string;
      voiceName?: string;
    };

    const cleanText = (text || '').trim();
    if (!cleanText) {
      res.status(400).json({ error: 'Text is required for speech synthesis.' });
      return;
    }

    const cacheKey = `${voiceName}:${cleanText}`;
    const cachedAudio = ttsCache.get(cacheKey);
    if (cachedAudio) {
      res.json({ audioBase64: cachedAudio, mimeType: 'audio/wav', cached: true });
      return;
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      res.status(503).json({ error: 'Gemini TTS unavailable, use client speech synthesis.' });
      return;
    }

    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash-lite-tts',
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: cleanText,
                // @ts-ignore - speechMetadata is supported by gemini-3.8-flash-lite-tts
                speechMetadata: {
                  style:
                    'Attentive, warm, clear, friendly science exhibition narrator explaining concepts in an easy-to-understand way to a live audience',
                },
              },
            ],
          },
        ],
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName },
            },
          },
        },
      });

      const base64Audio =
        response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

      if (base64Audio) {
        if (ttsCache.size > 60) {
          const oldestKey = ttsCache.keys().next().value;
          if (oldestKey) ttsCache.delete(oldestKey);
        }
        ttsCache.set(cacheKey, base64Audio);
        res.json({ audioBase64: base64Audio, mimeType: 'audio/wav', cached: false });
        return;
      }

      res.status(502).json({ error: 'No audio returned from TTS model.' });
    } catch (err: unknown) {
      console.warn('Gemini TTS fallback to browser speech:', err instanceof Error ? err.message : err);
      res.status(502).json({
        error: err instanceof Error ? err.message : 'TTS generation failed',
      });
    }
  });

  app.post('/api/chat', async (req, res) => {
    const { messages, modelChoice, persona } = (req.body || {}) as {
      messages?: Array<{ role: 'user' | 'model'; text: string }>;
      modelChoice?: string;
      persona?: string;
    };

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      res.status(400).json({ error: 'Conversation messages are required.' });
      return;
    }

    const systemInstruction =
      (persona && ROLE_INSTRUCTIONS[persona]) || ROLE_INSTRUCTIONS.curator;

    // Normalize multi-turn contents so it ALWAYS starts with 'user' and alternates 'user' / 'model'
    const normalizedContents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];
    for (const msg of messages) {
      const text = (msg.text || '').trim();
      if (!text) continue;
      const role: 'user' | 'model' = msg.role === 'model' ? 'model' : 'user';

      if (normalizedContents.length === 0 && role === 'model') {
        continue;
      }

      const prev = normalizedContents[normalizedContents.length - 1];
      if (prev && prev.role === role) {
        prev.parts[0].text += `\n\n${text}`;
      } else {
        normalizedContents.push({
          role,
          parts: [{ text }],
        });
      }
    }

    const latestUserText = messages[messages.length - 1]?.text || 'Tell me about the Fibonacci sequence.';

    if (normalizedContents.length === 0) {
      normalizedContents.push({
        role: 'user',
        parts: [{ text: latestUserText }],
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      res.json({
        reply: generateFibonacciLabResponse(latestUserText, persona || 'curator'),
        model: 'lab-knowledge-engine',
      });
      return;
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const candidateModels =
      modelChoice === 'gemini-3.1-flash-lite'
        ? ['gemini-3.1-flash-lite', 'gemini-3.8-flash', 'gemini-flash-latest']
        : ['gemini-3.8-flash', 'gemini-3.1-flash-lite', 'gemini-flash-latest'];

    for (const modelName of candidateModels) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: normalizedContents,
          config: {
            systemInstruction,
            temperature: 0.7,
          },
        });

        if (response.text) {
          res.json({
            reply: response.text,
            model: modelName,
          });
          return;
        }
      } catch (err: unknown) {
        console.warn(`Model ${modelName} attempt failed:`, err instanceof Error ? err.message : err);
      }
    }

    // Fallback to local mathematical knowledge engine if API quota is reached
    res.json({
      reply: generateFibonacciLabResponse(latestUserText, persona || 'curator'),
      model: 'lab-knowledge-engine',
    });
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Fibonacci Laboratory Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
