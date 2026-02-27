/**
 * ARIA 2.0 — Conversational Agent Service
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Strategy:
 *   1) Backend /aria/agent (agentic, function-calling, memory)
 *   2) Backend /aria/chat  (simple proxy fallback)
 *   3) Direct Gemini       (client-side last resort)
 *   4) Varied fallback pool
 *
 * Features:
 *   • Emotion detection in user messages
 *   • Persistent memory via /aria/memory
 *   • Agent tool actions (weather, mandi, schemes, predictions, navigation)
 *   • Offline conversation cache (AsyncStorage — last 24h)
 *   • Dialect-aware greeting
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDialectGreeting, getEncouragement, getMoodConfig } from '../data/dialects';

// ─── Configuration ────────────────────────────────────────────────────────────

const GOOGLE_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_API_KEY || '';
const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://10.17.16.40:8000';

const GEMINI_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

const CACHE_KEY = '@aria_conversation_cache';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

const LANGUAGE_LABELS = { hi: 'Hindi', en: 'English', mr: 'Marathi' };

// ─── Emotion Detection (client-side fast path) ───────────────────────────────

const EMOTION_KEYWORDS = {
  worried: [
    'tension', 'chinta', 'darr', 'kharab', 'barbad', 'nuksan',
    'worried', 'scared', 'loss', 'pareshan', 'mushkil', 'dikkat',
    'fikar', 'dukhi', 'tabah', 'khatam', 'चिंता', 'परेशान', 'नुकसान',
    'बर्बाद', 'मुश्किल', 'काळजी', 'अडचण',
  ],
  happy: [
    'khushi', 'accha', 'badhai', 'maza', 'profit', 'faida',
    'happy', 'great', 'best', 'wonderful', 'dhanyawad', 'shukriya',
    'खुशी', 'अच्छा', 'बधाई', 'धन्यवाद', 'मजा', 'आनंद',
  ],
  frustrated: [
    'kuch nahi', 'thak gaya', 'fed up', 'frustrated', 'pagal',
    'bakwas', 'bekar', 'koi fayda nahi',
    'थक', 'बकवास', 'बेकार', 'वैताग',
  ],
};

// ─── F2: Negotiate Intent Detection ──────────────────────────────────────────

const NEGOTIATE_KEYWORDS = [
  'negotiate', 'negotiation', 'bargain', 'price', 'bhav', 'rate',
  'kitna', 'kitne', 'kya bhav', 'saudebazi', 'mol', 'dam',
  'kitna milega', 'kya price', 'sell for', 'ask for',
  'kimat', 'bhav mangne', 'mandi rate', 'paisa', 'bikri',
  'किंमत', 'भाव', 'सौदेबाजी', 'मोलभाव', 'किती मिळेल',
  'कितना मिलेगा', 'क्या भाव', 'दाम', 'बेचना', 'बिक्री',
];

/**
 * Detect if user wants negotiation help — returns crop name or null.
 */
export const detectNegotiateIntent = (text) => {
  if (!text) return null;
  const lower = text.toLowerCase();
  const hasNegotiateKeyword = NEGOTIATE_KEYWORDS.some((kw) => lower.includes(kw));
  if (!hasNegotiateKeyword) return null;

  // Try to extract crop name
  const crops = [
    'onion', 'pyaz', 'pyaj', 'kanda', 'प्याज', 'कांदा',
    'tomato', 'tamatar', 'टमाटर',
    'potato', 'aloo', 'aaloo', 'आलू', 'बटाटा',
    'wheat', 'gehun', 'gehu', 'गेहूं', 'गहू',
    'rice', 'chawal', 'dhan', 'चावल', 'धान', 'तांदूळ',
    'soybean', 'soyabean', 'soya', 'सोयाबीन',
    'cotton', 'kapas', 'कपास', 'कापूस',
    'sugarcane', 'ganna', 'ऊस', 'गन्ना',
    'grape', 'angur', 'angoor', 'अंगूर', 'द्राक्ष',
  ];
  const foundCrop = crops.find((c) => lower.includes(c));
  return foundCrop || 'general';
};

/**
 * Suffix appended to ARIA replies when negotiate intent is detected.
 */
const negotiateSuffix = (languageCode) => {
  const lang = normalizeLanguageCode(languageCode);
  const suffixes = {
    hi: '\n\n💡 सौदेबाजी की प्रैक्टिस करने के लिए "सौदेबाजी सिम्युलेटर" पर जाएं →',
    en: '\n\n💡 Practice your bargaining skills in the Negotiation Simulator →',
    mr: '\n\n💡 सौदेबाजीचा सराव करण्यासाठी "सौदेबाजी सिम्युलेटर" वर जा →',
  };
  return suffixes[lang] || suffixes.en;
};

/**
 * Detect emotion from user text — returns 'worried' | 'happy' | 'frustrated' | null.
 */
export const detectEmotion = (text) => {
  if (!text) return null;
  const lower = text.toLowerCase();
  for (const [emotion, keywords] of Object.entries(EMOTION_KEYWORDS)) {
    for (const kw of keywords) {
      if (lower.includes(kw)) return emotion;
    }
  }
  return null;
};


// ─── Fallback Pool ────────────────────────────────────────────────────────────

const FALLBACK_POOL = {
  hi: [
    'Abhi network mein dikkat hai. Thodi der baad phir try karo. Tab tak mandi app mein price check karo.',
    'Server se connection nahi ho pa raha. Apni fasal ka storage dhyaan se karo, jaldi kharab na ho.',
    'Internet slow hai. Market screen pe jaake local mandi ka bhav dekho.',
    'Abhi jawab nahi mil raha. Ek kaam karo — apne crop ki photo Disease screen pe upload karo.',
    'Connection issue hai bhai. Weather section check karo — kal baarish hai toh aaj hi becho.',
    'Thoda rukho, network theek hoga. Tab tak Schemes section mein govt yojnayein dekh lo.',
  ],
  en: [
    'Network issue right now. Please try again in a moment. Meanwhile check mandi prices on Market screen.',
    'Could not reach the server. Make sure your internet is working and try again.',
    'Connection is slow. Check the Weather section — if rain is expected, sell today.',
    'Server is busy. Try again shortly. You can also check Disease screen for crop health.',
    'Unable to connect. Check the Schemes section for government subsidies while I fix this.',
    'Temporary issue. Please retype your question in a moment.',
  ],
  mr: [
    'नेटवर्कमध्ये अडचण आहे. थोड्या वेळाने पुन्हा प्रयत्न करा. तोपर्यंत बाजारभाव तपासा.',
    'सर्व्हरशी कनेक्शन होत नाही. तुमचे इंटरनेट तपासा आणि पुन्हा प्रयत्न करा.',
    'कनेक्शन स्लो आहे. हवामान विभाग तपासा — पाऊस असेल तर आजच विक्री करा.',
    'सर्व्हर व्यस्त आहे. थोड्या वेळाने पुन्हा प्रयत्न करा.',
    'तात्पुरती अडचण. कृपया थोड्या वेळाने पुन्हा विचारा.',
    'आत्ता उत्तर मिळत नाही. तुमच्या पिकाचा फोटो Disease स्क्रीनवर अपलोड करा.',
  ],
};

let _fallbackIndex = { hi: 0, en: 0, mr: 0 };

const normalizeLanguageCode = (code) => {
  const safe = String(code || 'en').trim().toLowerCase();
  return ['hi', 'en', 'mr'].includes(safe) ? safe : 'en';
};


// ─── Offline Cache ────────────────────────────────────────────────────────────

/**
 * Cache the latest conversation for offline access.
 */
export const cacheConversation = async (messages) => {
  try {
    const data = { messages: messages.slice(-30), ts: Date.now() };
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch {
    // silently fail
  }
};

/**
 * Load cached conversation (within 24h TTL).
 */
export const loadCachedConversation = async () => {
  try {
    const raw = await AsyncStorage.getItem(CACHE_KEY);
    if (!raw) return [];
    const data = JSON.parse(raw);
    if (Date.now() - data.ts > CACHE_TTL_MS) {
      await AsyncStorage.removeItem(CACHE_KEY);
      return [];
    }
    return data.messages || [];
  } catch {
    return [];
  }
};


// ─── Memory API ───────────────────────────────────────────────────────────────

/**
 * Fetch stored memories for a user.
 */
export const fetchMemories = async (userId, memoryType = null) => {
  try {
    let url = `${BACKEND_URL}/aria/memory/${userId}`;
    if (memoryType) url += `?memory_type=${memoryType}`;
    const resp = await fetch(url);
    if (!resp.ok) return [];
    return await resp.json();
  } catch {
    return [];
  }
};

/**
 * Store a new memory for a user.
 */
export const storeMemory = async (userId, memoryType, key, value) => {
  try {
    const resp = await fetch(`${BACKEND_URL}/aria/memory/${userId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        memory_type: memoryType,
        memory_key: key,
        memory_value: value,
      }),
    });
    return resp.ok;
  } catch {
    return false;
  }
};


// ═══════════════════════════════════════════════════════════════════════════════
// Strategy 1 — Agent Endpoint (agentic function-calling)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Call the ARIA 2.0 agent backend — this is the PRIMARY path.
 *
 * Returns: { reply, emotion, tool_actions, navigate_to, memories_updated, source }
 */
const fetchViaAgent = async ({ uiMessages, context, languageCode, userId, sessionId }) => {
  const url = `${BACKEND_URL}/aria/agent`;
  console.log('[ARIA] Trying agent endpoint:', url);

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: (uiMessages || []).slice(-12).map((m) => ({
        role: m.role,
        text: m.text || '',
      })),
      context: {
        crop: context?.crop || 'Unknown',
        district: context?.district || 'Unknown',
        state: context?.state || 'Maharashtra',
        risk_category: context?.risk_category || context?.riskCategory || 'Unknown',
        last_recommendation:
          context?.last_recommendation || context?.lastRecommendation || 'Unknown',
        farm_size_acres: context?.farm_size_acres || null,
        soil_type: context?.soil_type || null,
      },
      language_code: languageCode,
      user_id: userId || null,
      session_id: sessionId || null,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Agent endpoint failed: ${response.status} ${errText}`);
  }

  const data = await response.json();
  const reply = (data?.reply || '').trim();
  if (!reply) throw new Error('Agent returned empty reply');

  console.log('[ARIA] Agent reply OK, tools used:', data.tool_actions?.length || 0);

  return {
    reply,
    emotion: data.emotion || null,
    toolActions: data.tool_actions || [],
    navigateTo: data.navigate_to || null,
    memoriesUpdated: data.memories_updated || 0,
    source: 'agent',
  };
};


// ═══════════════════════════════════════════════════════════════════════════════
// Strategy 2 — Simple Backend Proxy (legacy fallback)
// ═══════════════════════════════════════════════════════════════════════════════

const fetchViaBackend = async ({ uiMessages, context, languageCode }) => {
  const url = `${BACKEND_URL}/aria/chat`;
  console.log('[ARIA] Trying backend proxy:', url);

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: (uiMessages || []).slice(-10).map((m) => ({
        role: m.role,
        text: m.text || '',
      })),
      context: {
        crop: context?.crop || 'Unknown',
        district: context?.district || 'Unknown',
        risk_category: context?.risk_category || context?.riskCategory || 'Unknown',
        last_recommendation:
          context?.last_recommendation || context?.lastRecommendation || 'Unknown',
      },
      language_code: languageCode,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Backend /aria/chat failed: ${response.status} ${errText}`);
  }

  const data = await response.json();
  const reply = (data?.reply || '').trim();
  if (!reply) throw new Error('Backend returned empty reply');
  console.log('[ARIA] Backend proxy reply OK');

  return {
    reply,
    emotion: null,
    toolActions: [],
    navigateTo: null,
    memoriesUpdated: 0,
    source: 'backend',
  };
};


// ═══════════════════════════════════════════════════════════════════════════════
// Strategy 3 — Direct Gemini (client-side fallback)
// ═══════════════════════════════════════════════════════════════════════════════

const buildSimpleSystemPrompt = (context, languageCode) => {
  const crop = context?.crop || 'Unknown';
  const district = context?.district || 'Unknown';
  const riskCategory = context?.risk_category || 'Unknown';
  const lastRecommendation = context?.last_recommendation || 'Unknown';
  const preferredLanguage = LANGUAGE_LABELS[normalizeLanguageCode(languageCode)] || 'English';

  return `Tu ARIA hai — ek AI assistant jo sirf Indian farmers ki madad karta hai.
Rules:
1. Hamesha usi bhasha mein jawab de jo farmer ne use ki
2. Simple words use kar — gaon ka kisan samjhe aise
3. Kabhi technical jargon mat use kar
4. Maximum 3 sentences mein jawab de
5. Hamesha ek clear action ke saath khatam kar
6. Sirf farming, mandi prices, weather, govt schemes ke baare mein baat kar
7. Agar koi aur topic aaye → 'Yeh mujhe nahi pata, kheti ke baare mein puchho' bol de

Farmer ka current data:
Crop: ${crop}, District: ${district}, Spoilage Risk: ${riskCategory}, Last Recommendation: ${lastRecommendation}

Reply language: ${preferredLanguage}.`;
};

const fetchViaDirect = async ({ uiMessages, context, languageCode }) => {
  if (!GOOGLE_API_KEY) throw new Error('GOOGLE_API_KEY missing in frontend env');

  const safeLanguage = normalizeLanguageCode(languageCode);
  const systemPrompt = buildSimpleSystemPrompt(context, safeLanguage);

  const conversationText = (uiMessages || [])
    .slice(-10)
    .map((msg) => `${msg.role === 'assistant' ? 'ARIA' : 'Farmer'}: ${msg.text || ''}`)
    .join('\n');

  const fullPrompt = `${systemPrompt}\n\nConversation so far:\n${conversationText}\n\nARIA:`;

  console.log('[ARIA] Trying direct Gemini');
  const response = await fetch(`${GEMINI_URL}?key=${GOOGLE_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: fullPrompt }] }],
      generationConfig: { temperature: 0.35, maxOutputTokens: 500 },
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Direct Gemini failed: ${response.status} ${text}`);
  }

  const data = await response.json();
  const text = (data?.candidates?.[0]?.content?.parts?.[0]?.text || '').trim();
  if (!text) throw new Error('Direct Gemini returned empty content');
  console.log('[ARIA] Direct Gemini reply OK');

  return {
    reply: text,
    emotion: null,
    toolActions: [],
    navigateTo: null,
    memoriesUpdated: 0,
    source: 'direct',
  };
};


// ═══════════════════════════════════════════════════════════════════════════════
// Public API
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Transcribe audio using Google Gemini multimodal API.
 * Reads the recorded audio file, converts to base64, and sends
 * to Gemini for speech-to-text transcription.
 */
export const transcribeWithWhisper = async ({ audioUri, languageCode }) => {
  try {
    if (!audioUri) {
      console.warn('[STT] No audioUri provided');
      return '';
    }

    const FileSystem = require('expo-file-system');

    // Read audio file as base64
    const base64Audio = await FileSystem.readAsStringAsync(audioUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    if (!base64Audio || base64Audio.length < 100) {
      console.warn('[STT] Audio file too small or empty');
      return '';
    }

    const langLabel = LANGUAGE_LABELS[languageCode] || languageCode || 'Hindi';

    // ── Strategy 1: Google Gemini multimodal (preferred) ──
    if (GOOGLE_API_KEY) {
      try {
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GOOGLE_API_KEY}`;
        const body = {
          contents: [
            {
              parts: [
                {
                  inlineData: {
                    mimeType: 'audio/m4a',
                    data: base64Audio,
                  },
                },
                {
                  text: `Transcribe this audio accurately. The speaker is likely speaking in ${langLabel}. Return ONLY the transcribed text, nothing else. If the audio is unclear or silent, return an empty string.`,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 500,
          },
        };

        const response = await fetch(geminiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });

        if (response.ok) {
          const data = await response.json();
          const transcript =
            data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
          console.log('[STT] Gemini transcription:', transcript.substring(0, 80));
          return transcript;
        } else {
          const errText = await response.text();
          console.warn('[STT] Gemini error:', response.status, errText.substring(0, 200));
        }
      } catch (geminiErr) {
        console.warn('[STT] Gemini STT failed:', geminiErr.message);
      }
    }

    // ── Strategy 2: Backend transcription endpoint ──
    try {
      const backendUrl = `${BACKEND_URL}/aria/transcribe`;
      const formData = new FormData();
      formData.append('audio', {
        uri: audioUri,
        type: 'audio/m4a',
        name: 'recording.m4a',
      });
      formData.append('language', languageCode || 'hi');

      const response = await fetch(backendUrl, {
        method: 'POST',
        body: formData,
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.ok) {
        const data = await response.json();
        const transcript = data?.transcript || data?.text || '';
        console.log('[STT] Backend transcription:', transcript.substring(0, 80));
        return transcript;
      }
    } catch (backendErr) {
      console.warn('[STT] Backend STT not available:', backendErr.message);
    }

    console.warn('[STT] All transcription strategies failed');
    return '';
  } catch (err) {
    console.error('[STT] transcribeWithWhisper error:', err);
    return '';
  }
};

/**
 * Fetch ARIA reply — cascading strategy:
 *   1. Agent (agentic with tools + memory)
 *   2. Backend proxy (simple chat)
 *   3. Direct Gemini (client-side)
 *   4. Throw → caller uses fallback
 *
 * Returns: { reply, emotion, toolActions, navigateTo, memoriesUpdated, source }
 */
export const fetchAriaReply = async ({
  uiMessages,
  context,
  languageCode,
  userId = null,
  sessionId = null,
}) => {
  // ─── F2: Detect negotiate intent in latest user message ───
  const lastUserMsg = [...(uiMessages || [])].reverse().find((m) => m.role === 'user');
  const negotiateCrop = lastUserMsg ? detectNegotiateIntent(lastUserMsg.text) : null;

  // Enhance context with negotiation hints if detected
  const enrichedContext = { ...context };
  if (negotiateCrop) {
    enrichedContext.negotiate_intent = true;
    enrichedContext.negotiate_crop = negotiateCrop !== 'general' ? negotiateCrop : (context?.crop || 'Unknown');
    console.log('[ARIA] Negotiate intent detected for crop:', enrichedContext.negotiate_crop);
  }

  // Strategy 1: Agent endpoint (primary)
  try {
    const result = await fetchViaAgent({ uiMessages, context: enrichedContext, languageCode, userId, sessionId });
    // If negotiate intent, suggest navigation to simulator
    if (negotiateCrop && !result.navigateTo) {
      result.navigateTo = 'NegotiationSimulator';
      result.reply += negotiateSuffix(languageCode);
    }
    return result;
  } catch (err) {
    console.warn('[ARIA] Agent failed:', err.message);
  }

  // Strategy 2: Backend proxy (legacy fallback)
  try {
    const result = await fetchViaBackend({ uiMessages, context: enrichedContext, languageCode });
    if (lastUserMsg) {
      result.emotion = detectEmotion(lastUserMsg.text);
    }
    if (negotiateCrop && !result.navigateTo) {
      result.navigateTo = 'NegotiationSimulator';
      result.reply += negotiateSuffix(languageCode);
    }
    return result;
  } catch (err) {
    console.warn('[ARIA] Backend proxy failed:', err.message);
  }

  // Strategy 3: Direct Gemini from client
  try {
    const result = await fetchViaDirect({ uiMessages, context: enrichedContext, languageCode });
    if (lastUserMsg) {
      result.emotion = detectEmotion(lastUserMsg.text);
    }
    if (negotiateCrop && !result.navigateTo) {
      result.navigateTo = 'NegotiationSimulator';
      result.reply += negotiateSuffix(languageCode);
    }
    return result;
  } catch (err) {
    console.warn('[ARIA] Direct Gemini failed:', err.message);
  }

  // All failed
  throw new Error('All ARIA strategies failed');
};

/**
 * Get a varied fallback reply — cycles through pool.
 */
export const getAriaFallbackReply = (languageCode) => {
  const lang = normalizeLanguageCode(languageCode);
  const pool = FALLBACK_POOL[lang] || FALLBACK_POOL.en;
  const idx = (_fallbackIndex[lang] || 0) % pool.length;
  _fallbackIndex[lang] = idx + 1;
  return pool[idx];
};

/**
 * Build ARIA's welcome message with dialect flavor.
 */
export const getAriaWelcome = (district, name, languageCode) => {
  return getDialectGreeting(district, name, languageCode);
};

/**
 * Get encouragement phrase for a distressed farmer.
 */
export { getEncouragement, getMoodConfig };
