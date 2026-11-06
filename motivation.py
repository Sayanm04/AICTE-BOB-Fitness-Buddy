"""
motivation.py
Generates motivational fitness tips via IBM Granite,
with curated fallbacks for offline / error scenarios.
"""

import random
from granite_service import generate_text

FALLBACK_TIPS = [
    "Every rep counts. Start where you are, use what you have, do what you can. 💪",
    "Consistency beats perfection. Show up today — even 10 minutes makes a difference!",
    "Rest is part of the plan. Recovery is when your body gets stronger.",
    "Fuel your body well. Food is energy, not the enemy.",
    "Celebrate small wins. Every push-up, every healthy meal — they all add up!",
    "Your only competition is yesterday's version of you.",
    "Progress is progress, no matter how slow. Keep moving forward!",
    "You've already shown up today. That's the hardest part done.",
]

THEMES = [
    "consistency and building habits",
    "overcoming self-doubt",
    "celebrating small victories",
    "the importance of rest and recovery",
    "staying motivated on tough days",
    "the joy of movement",
    "fuelling your body right",
    "the power of a positive mindset in fitness",
]


def get_motivational_tip() -> str:
    """
    Returns an AI-generated motivational message.
    Falls back to a curated tip if the AI service is unavailable.
    """
    theme = random.choice(THEMES)
    prompt = (
        f'You are Jason, a personal fitness coach. Write one powerful, concise '
        f'motivational message (2-3 sentences max) about: "{theme}". '
        "Make it warm, personal, and genuinely encouraging — not cliché. "
        "Do not use generic slogans. Sign off with '— Jason 💪'."
    )
    try:
        tip = generate_text(prompt, max_tokens=120)
        return tip if tip else random.choice(FALLBACK_TIPS)
    except Exception:
        return random.choice(FALLBACK_TIPS)
