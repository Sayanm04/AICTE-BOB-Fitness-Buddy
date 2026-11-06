'use strict';

const { generateText } = require('../services/graniteService');

/**
 * Generates a personalised home workout plan using IBM Granite.
 *
 * @param {Object} options
 * @param {string} options.fitnessLevel  - beginner | intermediate | advanced
 * @param {string} options.goal          - weight loss | muscle gain | endurance | flexibility | general fitness
 * @param {number} options.duration      - session duration in minutes
 * @param {string} options.equipment     - none | dumbbells | resistance bands | full gym
 * @returns {Promise<string>}            - Formatted workout plan
 */
async function getWorkoutSuggestion({ fitnessLevel = 'beginner', goal = 'general fitness', duration = 30, equipment = 'none' }) {
  const prompt = `You are Fitness Buddy, an expert fitness coach.

Create a detailed ${duration}-minute home workout plan for a ${fitnessLevel} with the goal of ${goal}. Available equipment: ${equipment}.

Format the plan as:
**Warm-Up (5 min)**
- List exercises

**Main Workout**
- List exercises with sets/reps/duration

**Cool-Down (5 min)**
- List stretches

Include brief form tips for each exercise and a safety reminder at the end.`;

  return generateText(prompt);
}

module.exports = { getWorkoutSuggestion };
