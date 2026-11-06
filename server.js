'use strict';

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { buildSystemPrompt } = require('./src/prompts/systemPrompt');
const { chatWithGranite } = require('./src/services/graniteService');
const { getWorkoutSuggestion } = require('./src/modules/workout');
const { getNutritionAdvice } = require('./src/modules/nutrition');
const { getMotivationalTip } = require('./src/modules/motivation');

const app = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ── Routes ────────────────────────────────────────────────────────

/**
 * POST /api/chat
 * Main conversational endpoint – sends user message to IBM Granite.
 */
app.post('/api/chat', async (req, res) => {
  const { message, history = [], userProfile = {} } = req.body;

  if (!message || typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({ error: 'Message is required.' });
  }

  try {
    const systemPrompt = buildSystemPrompt(userProfile);
    const reply = await chatWithGranite(message.trim(), history, systemPrompt);
    return res.json({ reply });
  } catch (err) {
    console.error('[/api/chat] Error:', err.message);
    return res.status(500).json({ error: 'AI service error. Please try again.' });
  }
});

/**
 * POST /api/workout
 * Returns a personalised workout plan.
 */
app.post('/api/workout', async (req, res) => {
  const { fitnessLevel = 'beginner', goal = 'general fitness', duration = 30, equipment = 'none' } = req.body;
  try {
    const plan = await getWorkoutSuggestion({ fitnessLevel, goal, duration, equipment });
    return res.json({ plan });
  } catch (err) {
    console.error('[/api/workout] Error:', err.message);
    return res.status(500).json({ error: 'Could not generate workout plan.' });
  }
});

/**
 * POST /api/nutrition
 * Returns a meal suggestion / nutrition advice.
 */
app.post('/api/nutrition', async (req, res) => {
  const { goal = 'balanced diet', restrictions = [], calories = null } = req.body;
  try {
    const advice = await getNutritionAdvice({ goal, restrictions, calories });
    return res.json({ advice });
  } catch (err) {
    console.error('[/api/nutrition] Error:', err.message);
    return res.status(500).json({ error: 'Could not generate nutrition advice.' });
  }
});

/**
 * GET /api/motivate
 * Returns a random motivational tip.
 */
app.get('/api/motivate', async (req, res) => {
  try {
    const tip = await getMotivationalTip();
    return res.json({ tip });
  } catch (err) {
    console.error('[/api/motivate] Error:', err.message);
    return res.status(500).json({ error: 'Could not generate motivational tip.' });
  }
});

/**
 * GET /api/health
 * Simple health-check endpoint.
 */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Fitness Buddy',
    model: process.env.GRANITE_MODEL_ID,
    timestamp: new Date().toISOString(),
  });
});

// ── Catch-all: serve the SPA ──────────────────────────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ── Start ─────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🏋️  Fitness Buddy is running at http://localhost:${PORT}`);
  console.log(`   Model : ${process.env.GRANITE_MODEL_ID}`);
  console.log(`   Region: ${process.env.WATSONX_URL}\n`);
});

module.exports = app;
