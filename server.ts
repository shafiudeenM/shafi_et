import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import * as Sentry from '@sentry/node';

dotenv.config();

// ---------- Sentry Server Init ----------
const sentryDsn = process.env.SENTRY_DSN || '';
if (sentryDsn) {
  Sentry.init({
    dsn: sentryDsn,
    tracesSampleRate: 1.0,
  });
  console.log('Sentry server-side error tracking enabled');
}

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || 'openrouter/auto';
const AI_RATE_LIMIT_PER_MINUTE = parseInt(process.env.AI_RATE_LIMIT_PER_MINUTE || '30', 10);

app.use(express.json());

// Enable CORS for mobile app (Capacitor) and cross-origin requests
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Simple in-memory rate limiting for AI endpoints
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function rateLimitMiddleware(req: express.Request, res: express.Response, next: express.NextFunction) {
  const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute window
  
  const record = rateLimitMap.get(clientIp);
  
  if (!record || now > record.resetTime) {
    rateLimitMap.set(clientIp, { count: 1, resetTime: now + windowMs });
    return next();
  }
  
  if (record.count >= AI_RATE_LIMIT_PER_MINUTE) {
    return res.status(429).json({ 
      success: false, 
      error: 'Rate limit exceeded. Please try again later.',
      retryAfter: Math.ceil((record.resetTime - now) / 1000)
    });
  }
  
  record.count++;
  next();
}

// OpenRouter client (OpenAI-compatible) using server-side API key.
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

type ChatMessage = { role: 'system' | 'user' | 'assistant'; content: string };

async function openRouterChat(
  messages: ChatMessage[],
  opts: { json?: boolean; maxTokens?: number } = {}
): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY is not set in environment.');
  }

  const body: any = {
    model: OPENROUTER_MODEL,
    messages,
  };
  if (opts.json) body.response_format = { type: 'json_object' };
  if (opts.maxTokens) body.max_tokens = opts.maxTokens;

  const res = await fetch(OPENROUTER_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      'HTTP-Referer': process.env.APP_URL || 'http://localhost:3000',
      'X-Title': 'TNTET Personal Coach',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`OpenRouter request failed (${res.status}): ${detail}`);
  }

  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content;
  if (typeof content !== 'string') {
    throw new Error('OpenRouter returned no content.');
  }
  return content;
}


// Server-side response cache for AI queries to ensure instant responses, zero latency & $0 repeat cost
const aiResponseCache = new Map<string, { reply: any; timestamp: number }>();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const CACHE_MAX_SIZE = 5000;

function getCachedAIResponse(key: string): any | null {
  const entry = aiResponseCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    aiResponseCache.delete(key);
    return null;
  }
  // Move to end for LRU behavior (most recently used)
  aiResponseCache.delete(key);
  aiResponseCache.set(key, entry);
  return entry.reply;
}

function setCachedAIResponse(key: string, reply: any): void {
  // Delete existing key if present to update position
  if (aiResponseCache.has(key)) {
    aiResponseCache.delete(key);
  }
  // Evict oldest entries if cache is full (LRU - least recently used at the beginning)
  while (aiResponseCache.size >= CACHE_MAX_SIZE) {
    const oldestKey = aiResponseCache.keys().next().value;
    if (oldestKey) aiResponseCache.delete(oldestKey);
  }
  aiResponseCache.set(key, { reply, timestamp: Date.now() });
}

// Health check API
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'TNTET Personal Coach API', cachedEntries: aiResponseCache.size });
});

// API: AI Tutor explanation for missed question (with rate limiting)
app.post('/api/tutor/explain', rateLimitMiddleware, async (req, res) => {
  try {
    const { question, selectedOption, correctOption, subject, topic, languageMode } = req.body;
    const isTamil = languageMode === 'tamil' || languageMode === 'bilingual';

    // 1. Check cache first
    const cacheKey = `explain:${subject}:${topic}:${question?.text?.slice(0, 40)}:${selectedOption}:${languageMode}`;
    const cached = getCachedAIResponse(cacheKey);
    if (cached) {
      return res.json({ success: true, data: cached, cached: true });
    }

    if (!process.env.OPENROUTER_API_KEY) {
      // Fallback deterministic response
      const fallbackData = {
        conceptExplanation: isTamil
          ? `**கருத்து விளக்கம் (Concept Clarification):** ${topic} பாடப்பிரிவில் முக்கிய கொள்கை என்னவெனில், சரியான விடை "${correctOption}". உங்கள் விடை "${selectedOption}" ஒரு பொதுவான கவனக்குறைவு அல்லது தவறான புரிதலால் ஏற்பட்டது.`
          : `**Concept Clarification:** In ${topic} (${subject}), the correct concept leads to "${correctOption}". The option "${selectedOption}" is a common distractor trap.`,
        distractorAnalysis: isTamil
          ? `நீங்கள் தேர்வு செய்த விருப்பம் "${selectedOption}" தேர்வில் பெரும்பாலும் குழப்பத்தை உருவாக்கும் ஒரு கவனச்சிதறல் (distractor) ஆகும். வினாவின் முக்கிய நிபந்தனையை கவனிக்கவும்.`
          : `The chosen option "${selectedOption}" is a frequent exam distractor trap. Verify the exact subject constraints before concluding.`,
        trbKeyRule: isTamil
          ? `TRB தேர்வு வழிகாட்டுதல்: வினாக்களை வாசிக்கும்போது 'அல்லாதது', 'சரியற்றது' போன்ற முக்கிய சொற்களை உன்னிப்பாக கவனியுங்கள்.`
          : `TRB Exam Tip: Always verify the exact question keywords and foundational definitions before picking the tempting distractor.`,
        threeCheckQuestions: [
          {
            question: isTamil ? `${topic} சார்ந்த அடுத்த பயிற்சி வினா: இதன் முதன்மை அம்சம் என்ன?` : `Follow-up quick check on ${topic}: What is the core rule?`,
            options: isTamil ? ['சரியான அடிப்படைக் கோட்பாடு', 'மாற்று வழிமுறை', 'முறையற்ற பயன்பாடு', 'மேற்கண்ட எதுவும் இல்லை'] : ['Foundational Principle', 'Alternative Method', 'Improper Application', 'None of the above'],
            correctIndex: 0,
            shortExplanation: isTamil ? 'அடிப்படைக் கோட்பாடுகளை புரிந்து கொள்வதே சரியான அணுகுமுறையாகும்.' : 'Understanding the core foundational principle is essential for TNTET.'
          }
        ]
      };
      return res.json({ success: true, data: fallbackData });
    }

    const systemPrompt = `You are an expert Tamil Nadu Teacher Eligibility Test (TNTET) Master Tutor and Child Pedagogy / Subject Specialist.
You strictly adhere to Tamil Nadu State Board (SCERT) syllabus and official TRB TNTET exam standards.
You explain concepts with high pedagogical clarity.
Language preference requested: ${isTamil ? 'Simple, authentic Tamil (தமிழ்) keeping official TRB terminology accurate, with bilingual English support' : 'Clear English'}.
Keep explanations crisp, empathetic, actionable, and focused on helping the teacher aspirant permanently close this concept gap.
Output in structured JSON format with fields:
- "conceptExplanation": markdown string explaining the core concept clearly and why the correct answer is right.
- "distractorAnalysis": why the user's chosen answer was tempting and what misconception it represents.
- "trbKeyRule": one concise mnemonic or formula or golden rule for TRB exam.
- "threeCheckQuestions": array of 3 short multiple choice questions to immediately verify understanding, each with question, options (4), and correctIndex (0-3), and shortExplanation.`;

    const userPrompt = `Candidate missed the following TNTET question in subject "${subject}", topic "${topic}":
Question: "${question?.text || ''}"
Candidate's Selected Option: "${selectedOption}"
Correct Option: "${correctOption}"
Full Options: ${JSON.stringify(question?.options || [])}

Please provide a targeted concept explanation and 3 quick check verification questions.`;

    const content = await openRouterChat(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      { json: true }
    );

    const parsed = JSON.parse(content);
    setCachedAIResponse(cacheKey, parsed);
    res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Error in /api/tutor/explain, gracefully falling back:', error);
    // Graceful seamless fallback - no error screen for candidates
    const { topic, subject, correctOption, selectedOption, languageMode } = req.body || {};
    const isTamil = languageMode === 'tamil' || languageMode === 'bilingual';
    res.json({ 
      success: true, 
      data: {
        conceptExplanation: isTamil 
          ? `**${topic || subject || 'கருத்து'} விளக்கம்:** TNTET தேர்வு வழிகாட்டுதலின்படி, சரியான விடை "${correctOption}".`
          : `**${topic || subject || 'Concept'} Explanation:** As per TRB SCERT standards, the verified concept is "${correctOption}".`,
        distractorAnalysis: isTamil 
          ? `"${selectedOption}" என்பது பொதுவான கவனச்சிதறல் விருப்பம்.` 
          : `"${selectedOption}" is a common distractor trap.`,
        trbKeyRule: isTamil
          ? 'முக்கிய பாடநூல் வரையறைகளை தொடர்ந்து பயிற்சி செய்யுங்கள்.'
          : 'Revisit SCERT textbook definitions and keywords for high retention.',
        threeCheckQuestions: []
      }
    });
  }
});

// API: AI Tutor Chat (Focused on TNTET syllabus & candidate doubts, with rate limiting)
app.post('/api/tutor/chat', rateLimitMiddleware, async (req, res) => {
  try {
    const { message, context, languageMode } = req.body;
    const isTamil = languageMode === 'tamil' || languageMode === 'bilingual';

    // Check cache
    const cacheKey = `chat:${message?.trim().toLowerCase().slice(0, 80)}:${context?.topic || ''}:${languageMode}`;
    const cached = getCachedAIResponse(cacheKey);
    if (cached) {
      return res.json({ success: true, reply: cached, cached: true });
    }

    if (!process.env.OPENROUTER_API_KEY) {
      return res.json({
        success: true,
        reply: isTamil
          ? `TNTET பாடத்திட்டத்தின்படி, ${context?.topic || 'இந்த தலைப்பில்'} கேள்விகள் எப்போதும் அடிப்படைக் கருத்துக்களை அடிப்படையாகக் கொண்டவை. உங்கள் சந்தேகத்தை மேலும் தெளிவுபடுத்த தயங்காதீர்கள்!`
          : `According to the TNTET syllabus for ${context?.topic || 'this subject'}, key concepts are derived from SCERT standards. Feel free to ask specific concept questions!`
      });
    }

    const systemPrompt = `You are a personalized TNTET (Tamil Nadu Teacher Eligibility Test) AI Mentor.
You only answer questions strictly related to the candidate's TNTET Paper I & Paper II syllabus (CDP, Tamil, English, Mathematics, Science, Social Science, EVS).
Candidate context: Paper: ${context?.paper || 'Paper I'}, Target Subject: ${context?.subject || 'All'}, Current Weak Topic: ${context?.weakTopic || 'None'}.
Language: ${isTamil ? 'Tamil (தமிழ்) with accurate educational terms' : 'English'}.
Be concise, encouraging, and provide exam-oriented insights.`;

    const replyText = await openRouterChat([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: message },
    ]);
    setCachedAIResponse(cacheKey, replyText);
    res.json({ success: true, reply: replyText });
  } catch (error: any) {
    console.error('Error in /api/tutor/chat, using fallback:', error);
    const { languageMode } = req.body || {};
    const isTamil = languageMode === 'tamil' || languageMode === 'bilingual';
    res.json({ 
      success: true, 
      reply: isTamil
        ? 'TNTET தேர்வில் இக்கருத்துகள் முக்கிய பங்கு வகிக்கின்றன. SCERT பாடநூல் கருத்துக்களை முழுமையாக படித்து பயிற்சி செய்யுங்கள்.'
        : 'This concept is vital for TNTET. Review the SCERT textbook foundational rules to lock in your score.'
    });
  }
});

// API: Diagnostic Analysis Prescription (with rate limiting)
app.post('/api/diagnose/prescribe', rateLimitMiddleware, async (req, res) => {
  try {
    const { results, paper, languageMode } = req.body;
    const isTamil = languageMode === 'tamil' || languageMode === 'bilingual';

    if (!process.env.OPENROUTER_API_KEY) {
      return res.json({
        success: true,
        prescription: isTamil
          ? "உங்கள் ஆரம்பநிலை மதிப்பீட்டின்படி, பின்னங்கள் (Fractions) மற்றும் குழந்தை வளர்ச்சி நிலைகள் (CDP) ஆகியவற்றில் கூடுதல் கவனம் தேவைப்படுகிறது. தினசரி 35 நிமிட திட்டத்தைப் பின்பற்றுங்கள்."
          : "Based on your diagnostic assessment, focus on Fractions (Maths) and Cognitive Development Stages (CDP) to lift your score above the qualifying margin."
      });
    }

    const prescription = await openRouterChat([
      {
        role: 'user',
        content: `Candidate diagnostic score: ${JSON.stringify(results)} for ${paper}. Provide a 2-sentence actionable prescription for what to study today in ${isTamil ? 'Tamil' : 'English'}.`,
      },
    ]);

    res.json({ success: true, prescription });
  } catch (error: any) {
    console.error('Error in /api/diagnose/prescribe:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ---------- Sentry Express Error Handler ----------
// Must be registered after all routes but before the SPA fallback
Sentry.setupExpressErrorHandler(app);

// Start Express and integrate Vite middleware
async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`TNTET Personal Coach server running on port ${PORT}`);
  });
}

start();
