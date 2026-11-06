"""
nutrition.py
Generates personalised nutrition advice and meal ideas via IBM Granite.
Compatible with Python 3.8+.
"""

from typing import List, Optional

from granite_service import generate_text


def get_nutrition_advice(
    goal: str = "balanced diet",
    restrictions: Optional[List[str]] = None,
    calories: Optional[int] = None,
) -> str:
    """
    Args:
        goal: balanced diet | weight loss | muscle gain | energy boost
        restrictions: e.g. ["vegetarian", "gluten-free"]
        calories: target daily calories (optional)

    Returns:
        Formatted nutrition advice string.
    """
    restrictions = restrictions or []
    restriction_note = (
        f"Dietary restrictions/preferences: {', '.join(restrictions)}."
        if restrictions
        else "No specific dietary restrictions."
    )
    calorie_note = (
        f"Target daily calories: approximately {calories} kcal."
        if calories
        else ""
    )

    prompt = f"""You are Jason, a knowledgeable nutrition advisor and fitness coach.

Provide practical, easy-to-follow nutrition advice and simple meal ideas \
for someone whose goal is: {goal}.
{restriction_note}
{calorie_note}

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

Keep suggestions affordable, realistic, and delicious. Avoid extreme diets."""

    return generate_text(prompt, max_tokens=700)
