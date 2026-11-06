'use strict';

const { generateText } = require('../services/graniteService');

// Fallback tips used when the AI service is unavailable
const FALLBACK_TIPS = [
  'Every rep counts. Start where you are, use what you have, do what you can. 💪',
  'Consistency beats perfection. Show up today — even 10 minutes makes a difference!',
  'Rest is part of the plan. Recovery is when your body gets stronger.',
  'Fuel your body well. Food is energy, not the enemy.',
  'Celebrate small wins. Every push-up, every healthy meal — they all add up!',
  'Your only competition is yesterday\'s version of you.',
  'Progress is progress, no matter how slow. Keep moving forward!',
  'You\'ve already shown up today. That\'s the hardest part done.',
];

/**
 * Generates a motivational fitness tip using IBM Granite.
 * Falls back to a curated local tip if AI is unavailable.
 *
 * @returns {Promise<string>} - Motivational message
 */
async function getMotivationalTip() {
  const themes = [
    'consistency and building habits',
    'overcoming self-doubt',
    'celebrating small victories',
    'the importance of rest and recovery',
    'staying motivated on tough days',
    'the joy of movement',
    'fuelling your body right',
    'the power of a positive mindset in fitness',
  ];

  const theme = themes[Math.floor(Math.random() * themes.length)];

  const prompt = `You are Fitness Buddy. Write one powerful, concise motivational message (2-3 sentences max) about: "${theme}".
Make it warm, personal, and genuinely encouraging — not cliché. Do not use generic slogans.`;

  try {
    const tip = await generateText(prompt);
    return tip || FALLBACK_TIPS[Math.floor(Math.random() * FALLBACK_TIPS.length)];
  } catch {
    return FALLBACK_TIPS[Math.floor(Math.random() * FALLBACK_TIPS.length)];
  }
}

module.exports = { getMotivationalTip };
