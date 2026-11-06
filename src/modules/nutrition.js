'use strict';

const { generateText } = require('../services/graniteService');

/**
 * Generates personalised nutrition advice and meal suggestions.
 *
 * @param {Object} options
 * @param {string}   options.goal         - weight loss | muscle gain | balanced diet | energy boost
 * @param {string[]} options.restrictions - e.g. ['vegetarian', 'gluten-free', 'dairy-free']
 * @param {number|null} options.calories  - target daily calories (optional)
 * @returns {Promise<string>}             - Formatted nutrition advice
 */
async function getNutritionAdvice({ goal = 'balanced diet', restrictions = [], calories = null }) {
  const restrictionNote = restrictions.length > 0
    ? `Dietary restrictions/preferences: ${restrictions.join(', ')}.`
    : 'No specific dietary restrictions.';

  const calorieNote = calories
    ? `Target daily calories: approximately ${calories} kcal.`
    : '';

  const prompt = `You are Fitness Buddy, a knowledgeable nutrition advisor.

Provide practical, easy-to-follow nutrition advice and simple meal ideas for someone whose goal is: ${goal}.
${restrictionNote}
${calorieNote}

Structure your response as:
**Daily Nutrition Tips**
- 3-4 key principles

**Sample Meal Plan (1 Day)**
- Breakfast
- Mid-Morning Snack
- Lunch
- Afternoon Snack
- Dinner

**Hydration Tip**

Keep suggestions affordable, realistic, and delicious. Avoid extreme diets.`;

  return generateText(prompt);
}

module.exports = { getNutritionAdvice };
