"""
workout.py
Generates personalised home workout plans via IBM Granite.
"""

from granite_service import generate_text


def get_workout_plan(
    fitness_level: str = "beginner",
    goal: str = "general fitness",
    duration: int = 30,
    equipment: str = "none",
) -> str:
    """
    Args:
        fitness_level: beginner | intermediate | advanced
        goal: weight loss | muscle gain | endurance | flexibility | general fitness
        duration: session length in minutes
        equipment: none | dumbbells | resistance bands | full gym

    Returns:
        Formatted workout plan string.
    """
    prompt = f"""You are Jason, an expert fitness coach and personal trainer.

Create a detailed {duration}-minute home workout plan for a {fitness_level} \
with the goal of {goal}. Available equipment: {equipment}.

Format the plan as:
**Warm-Up (5 min)**
- List exercises

**Main Workout**
- List exercises with sets/reps/duration and a brief form tip for each

**Cool-Down (5 min)**
- List stretches

End with one safety reminder."""

    return generate_text(prompt, max_tokens=700)
