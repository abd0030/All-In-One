import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 10000;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Supabase & Keys configuration
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
const GROQ_API_KEY = process.env.GROQ_API_KEY || process.env.VITE_GROQ_API_KEY || '';
const SAFEPAY_API_KEY = process.env.SAFEPAY_API_KEY || '';
const SAFEPAY_MERCHANT_KEY = process.env.SAFEPAY_MERCHANT_KEY || '';
const SAFEPAY_ENV = process.env.SAFEPAY_ENV || 'sandbox';

const supabase = (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY)
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
  : null;

// ============================================================
// 1. HEALTH & STATUS ENDPOINTS (For Render Health Checks)
// ============================================================
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    service: 'All In One Classifieds API Backend',
    uptime: `${Math.floor(process.uptime())}s`,
    timestamp: new Date().toISOString(),
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', uptime: process.uptime() });
});

app.get('/api/status', (req, res) => {
  res.json({
    status: 'ok',
    environment: process.env.NODE_ENV || 'production',
    safepay_env: SAFEPAY_ENV,
    has_groq: !!GROQ_API_KEY,
    has_supabase: !!supabase,
    timestamp: new Date().toISOString(),
  });
});

// ============================================================
// 2. AI ASSISTANT ENDPOINT (/api/chat)
// ============================================================
const GROQ_MODELS = ['openai/gpt-oss-120b', 'openai/gpt-oss-20b', 'qwen/qwen3.6-27b', 'llama-3.3-70b-versatile'];

const SYSTEM_INSTRUCTION = `You are the official conversational AI Assistant for "All In One Classified" marketplace in Pakistan.

YOUR CAPABILITIES & BEHAVIOR:
1. MULTILINGUAL AUTOMATIC DETECTION:
   - Detect the user's input language automatically: English, Urdu (اردو), Roman Urdu (e.g. "ma ad kaisy post kro?", "yar mobile sell karna hai", "ye website kis ne banayi hai?"), or mixed English-Urdu.
   - Respond fluently in the EXACT SAME LANGUAGE and tone as the user!
   - If the user speaks Roman Urdu, reply naturally in friendly Roman Urdu!
   - If the user speaks Urdu, reply in proper Urdu (اردو)!
   - If the user speaks English, reply in clear English!

2. GENERAL AI KNOWLEDGE:
   - For general questions ("Hello", "How are you?", "What is Python?", "What is Artificial Intelligence?", math, science, history, coding), answer naturally, intelligently, and accurately using your broad AI knowledge in the user's language!

3. MARKETPLACE & PROJECT KNOWLEDGE:
   - Project Developer & Creator: **Abdullah Aftab** is the software engineer/developer who designed, developed, architected, and built the All In One Classified Marketplace platform (web application, mobile app, and backend).
   - Project Investor: **Shahid Mehmood** is the investor who provided funding and strategic investment for the All In One Classified Marketplace project.
   - For marketplace features (posting ads, account registration, categories, subcategories, product conditions [New, Used, Refurbished, Open Box], Safepay promotion payments, seller verification, text & voice messaging), guide users kindly and accurately.
`;

app.post('/api/chat', async (req, res) => {
  try {
    const { message, history } = req.body || {};
    const userQuery = (message || '').trim();

    if (!userQuery) {
      return res.status(400).json({ error: 'Message cannot be empty.' });
    }

    if (!GROQ_API_KEY) {
      return res.json({
        reply: "Welcome to All In One Classifieds! I'm here to help you browse ads, post new listings, or answer any questions about our marketplace.",
        model: 'fallback-static',
      });
    }

    const messages = [
      { role: 'system', content: SYSTEM_INSTRUCTION },
    ];

    if (Array.isArray(history)) {
      history.slice(-6).forEach((h) => {
        if (h && h.role && h.content) {
          messages.push({
            role: h.role === 'user' ? 'user' : 'assistant',
            content: String(h.content),
          });
        }
      });
    }

    messages.push({ role: 'user', content: userQuery });

    let lastError = null;
    for (const model of GROQ_MODELS) {
      try {
        const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${GROQ_API_KEY}`,
          },
          body: JSON.stringify({
            model,
            messages,
            temperature: 0.6,
            max_tokens: 800,
          }),
        });

        if (groqRes.ok) {
          const data = await groqRes.json();
          const reply = data.choices?.[0]?.message?.content;
          if (reply) {
            return res.json({ reply, model });
          }
        } else {
          const errData = await groqRes.json().catch(() => ({}));
          lastError = errData;
        }
      } catch (err) {
        lastError = err;
      }
    }

    res.json({
      reply: "Assalam-o-Alaikum! Welcome to All In One Classifieds. How can I assist you with your buying or selling today?",
      model: 'fallback-default',
      error: lastError,
    });
  } catch (error) {
    console.error('API /api/chat error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// ============================================================
// 3. SAFEPAY PAYMENT ENDPOINTS
// ============================================================
const PACKAGES = {
  urgent: { name: 'Urgent Badge', price: 500, duration: 7 },
  featured: { name: 'Featured Ad', price: 1200, duration: 15 },
  vip: { name: 'Premium VIP', price: 2500, duration: 30 },
};

app.post('/api/safepay/create-tracker', async (req, res) => {
  try {
    const { listing_id, user_id, package_id } = req.body || {};

    if (!listing_id || !user_id || !package_id || !PACKAGES[package_id]) {
      return res.status(400).json({ error: 'Missing required parameters (listing_id, user_id, package_id)' });
    }

    const pkg = PACKAGES[package_id];
    const amountInPkr = pkg.price;
    const clientKey = SAFEPAY_MERCHANT_KEY || SAFEPAY_API_KEY || '';

    const safepayHost = SAFEPAY_ENV === 'sandbox'
      ? 'https://sandbox.api.getsafepay.com'
      : 'https://api.getsafepay.com';

    const safepayResponse = await fetch(`${safepayHost}/order/v1/init`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client: clientKey,
        amount: amountInPkr,
        currency: 'PKR',
        environment: SAFEPAY_ENV,
      }),
    });

    const safepayData = await safepayResponse.json();
    const trackerToken = safepayData?.data?.token || safepayData?.tracker?.token || safepayData?.token;

    if (!trackerToken) {
      return res.status(400).json({ error: 'Failed to initialize payment tracker with Safepay', details: safepayData });
    }

    if (supabase) {
      await supabase.from('payments').insert({
        listing_id,
        user_id,
        amount: amountInPkr,
        package: package_id,
        duration_days: pkg.duration,
        payment_method: 'safepay',
        transaction_id: trackerToken,
        status: 'pending',
      });
    }

    res.status(200).json({
      token: trackerToken,
      amount: amountInPkr,
      package_name: pkg.name,
      environment: SAFEPAY_ENV,
    });
  } catch (error) {
    console.error('Error creating Safepay tracker:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/api/safepay/verify-tracker', async (req, res) => {
  try {
    const { tracker_token } = req.body || {};
    if (!tracker_token) {
      return res.status(400).json({ error: 'Missing tracker_token' });
    }

    if (supabase) {
      const { data: paymentRecord } = await supabase
        .from('payments')
        .select('*')
        .eq('transaction_id', tracker_token)
        .single();

      if (paymentRecord && paymentRecord.status !== 'completed') {
        await supabase
          .from('payments')
          .update({ status: 'completed', updated_at: new Date().toISOString() })
          .eq('id', paymentRecord.id);

        const durationDays = paymentRecord.duration_days || 7;
        const featuredUntil = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString();

        await supabase
          .from('listings')
          .update({
            is_featured: true,
            featured_until: featuredUntil,
          })
          .eq('id', paymentRecord.listing_id);
      }
    }

    res.status(200).json({ success: true, message: 'Payment verified successfully.' });
  } catch (error) {
    console.error('Error verifying Safepay tracker:', error);
    res.status(500).json({ error: 'Verification failed' });
  }
});

app.post('/api/safepay/webhook', (req, res) => {
  res.status(200).json({ received: true });
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 All In One Backend Server running on port ${PORT} [env: ${process.env.NODE_ENV || 'production'}]`);
});
