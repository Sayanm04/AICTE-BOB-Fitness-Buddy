"""
app.py  –  Fitness Buddy  |  Streamlit + IBM Granite
Run:  streamlit run app.py
"""

import datetime
import html
import streamlit as st
from dotenv import load_dotenv

load_dotenv()

# ── Page config ─────────────────────────────────────────────────────
st.set_page_config(
    page_title="Fitness Buddy",
    page_icon="🏋️",
    layout="wide",
    initial_sidebar_state="expanded",
)

# ── Custom CSS ───────────────────────────────────────────────────────
st.markdown(
    """
    <style>
    /* ── Global ── */
    [data-testid="stAppViewContainer"] { background: #0f1117; }
    [data-testid="stSidebar"]          { background: #1a1d27; border-right: 1px solid #2e3248; }
    [data-testid="stSidebar"] * { color: #e8eaf6 !important; }
    .block-container { padding-top: 1.5rem; }

    /* ── Chat bubbles ── */
    .user-bubble {
        background: #2d2356;
        border: 1px solid #3d2f72;
        border-radius: 18px 4px 18px 18px;
        padding: 12px 16px;
        margin: 6px 0;
        color: #d8d4ff;
        font-size: 0.95rem;
        line-height: 1.6;
        max-width: 82%;
        margin-left: auto;
    }
    .bot-bubble {
        background: #1e2235;
        border: 1px solid #2e3248;
        border-radius: 4px 18px 18px 18px;
        padding: 12px 16px;
        margin: 6px 0;
        color: #e8eaf6;
        font-size: 0.95rem;
        line-height: 1.6;
        max-width: 82%;
    }

    /* ── Motivate card ── */
    .motivate-card {
        background: #1e2235;
        border: 1px solid #2e3248;
        border-radius: 16px;
        padding: 28px 32px;
        text-align: center;
        font-size: 1.15rem;
        font-style: italic;
        color: #e8eaf6;
        line-height: 1.8;
        margin: 12px 0;
    }

    /* ── Streak badge ── */
    .streak-badge {
        background: #1a1d27;
        border: 2px solid #6c63ff;
        border-radius: 50%;
        display: inline-block;
        font-size: 2.2rem;
        font-weight: 800;
        color: #6c63ff;
        padding: 18px 28px;
        text-align: center;
    }

    /* ── Result box ── */
    .result-box {
        background: #1a1d27;
        border: 1px solid #2e3248;
        border-radius: 12px;
        padding: 20px 24px;
        color: #e8eaf6;
        font-size: 0.92rem;
        line-height: 1.75;
        margin-top: 12px;
    }

    /* ── Hide Streamlit default chrome ── */
    #MainMenu, footer, header { visibility: hidden; }
    </style>
    """,
    unsafe_allow_html=True,
)

# ── Welcome message shown once when chat history is empty ────────────
JASON_WELCOME = (
    "👋 Hey there! Welcome to **Fitness Buddy**!\n\n"
    "I'm **Jason**, your personal AI Fitness Buddy! 💪\n\n"
    "I'm here to help you build a healthier, stronger, and happier lifestyle. "
    "Think of me as your friendly fitness companion — always ready to motivate you, "
    "guide you, and keep you on track toward your fitness goals.\n\n"
    "Whether you're a **beginner** starting your fitness journey or someone looking "
    "to level up an existing routine, I've got your back!\n\n"
    "### 🏋️ What Can I Do for You?\n"
    "- **Personalized Workouts** — Plans tailored to your fitness level, goals, and available time\n"
    "- **Nutrition Guidance** — Healthy meal ideas and simple nutritional tips\n"
    "- **Daily Motivation** — Positive reminders and encouragement to keep pushing forward\n"
    "- **Healthy Habits** — Better routines for exercise, hydration, sleep, and overall wellness\n"
    "- **Fitness Goals** — Practical support for weight loss, muscle building, stamina & more\n\n"
    "### 💬 Ask Me Anything!\n"
    "- How can I lose weight at home?\n"
    "- Give me a 20-minute beginner workout.\n"
    "- Suggest a healthy Indian diet plan.\n"
    "- How can I build muscle without going to the gym?\n"
    "- Motivate me to exercise today!\n\n"
    "**Remember:** Progress takes time. Stay consistent, believe in yourself, and never give up! 🔥\n\n"
    "*Disclaimer: I provide general fitness and nutrition information, not medical advice. "
    "Consult a qualified healthcare professional before making significant changes to your "
    "diet or exercise routine, especially if you have an existing medical condition.*\n\n"
    "**I'm Jason, your Fitness Buddy. Let's get stronger together! 💪🔥**"
)

# ── Session state defaults ───────────────────────────────────────────
def _init_state():
    defaults = {
        "chat_history": [{"role": "assistant", "content": JASON_WELCOME}],
        "streak": 0,
        "last_log_date": "",
        "tip_text": "Click **Inspire Me** below to get your daily boost! 💪",
        "workout_result": "",
        "nutrition_result": "",
    }
    for key, val in defaults.items():
        if key not in st.session_state:
            st.session_state[key] = val

_init_state()

# ── Sidebar ──────────────────────────────────────────────────────────
with st.sidebar:
    st.markdown("## 🏋️ Fitness Buddy")
    st.markdown("#### 👋 Hi, I'm **Jason**!")
    st.caption("Your AI Fitness Buddy · Powered by **IBM Granite** on watsonx.ai")
    st.divider()

    page = st.radio(
        "Navigate",
        ["💬 Chat", "🏃 Workout Planner", "🥗 Nutrition Guide", "⚡ Motivate Me"],
        label_visibility="collapsed",
    )

    st.divider()
    st.markdown("### 👤 Your Profile")
    profile_name         = st.text_input("Name",          placeholder="e.g. Alex",          key="p_name")
    profile_age          = st.text_input("Age",           placeholder="e.g. 28",            key="p_age")
    profile_level        = st.selectbox("Fitness Level",  ["", "Beginner", "Intermediate", "Advanced"], key="p_level")
    profile_goal         = st.selectbox("Goal",           ["", "Weight Loss", "Muscle Gain", "Endurance", "Flexibility", "General Fitness"], key="p_goal")
    profile_restrictions = st.text_input("Restrictions",  placeholder="e.g. vegan, knee injury", key="p_restrict")

    st.divider()
    st.caption("IBM Cloud · watsonx.ai")

# ── Build user profile dict ──────────────────────────────────────────
user_profile = {
    "name":          st.session_state.p_name,
    "age":           st.session_state.p_age,
    "fitness_level": st.session_state.p_level.lower() if st.session_state.p_level else "",
    "goal":          st.session_state.p_goal.lower()  if st.session_state.p_goal  else "",
    "restrictions":  st.session_state.p_restrict,
}

# ════════════════════════════════════════════════════════════════════
# PAGE 1 — CHAT
# ════════════════════════════════════════════════════════════════════
if page == "💬 Chat":
    from granite_service import chat_with_granite
    from system_prompt import build_system_prompt

    st.title("💬 Chat with Jason — Your Fitness Buddy")
    st.caption("Hi! I'm **Jason**, your AI-powered personal health & fitness coach. Ask me anything!")

    # Quick-prompt chips
    col1, col2, col3, col4 = st.columns(4)
    quick_prompts = {
        col1: "Give me a quick 20-minute beginner home workout.",
        col2: "What should I eat before and after a workout?",
        col3: "How do I stay consistent with my fitness routine?",
        col4: "I'm feeling tired and unmotivated today. Help me!",
    }
    quick_labels = ["🏃 20-min Workout", "🥗 Pre/Post Meal", "🔄 Stay Consistent", "⚡ Motivate Me"]
    for (col, prompt), label in zip(quick_prompts.items(), quick_labels):
        if col.button(label, use_container_width=True):
            st.session_state["pending_quick"] = prompt

    st.divider()

    # Render existing messages
    for msg in st.session_state.chat_history:
        if msg["role"] == "user":
            # User text: escape HTML to prevent injection
            safe_content = html.escape(msg["content"]).replace("\n", "<br>")
            st.markdown(
                f'<div class="user-bubble">🧑&nbsp;&nbsp;{safe_content}</div>',
                unsafe_allow_html=True,
            )
        else:
            # Bot text: render inside styled container using st.markdown (preserves bold/lists)
            with st.container():
                st.markdown(
                    '<div class="bot-bubble" style="padding:12px 16px;">',
                    unsafe_allow_html=True,
                )
                st.markdown(f"🤖 &nbsp; {msg['content']}")
                st.markdown("</div>", unsafe_allow_html=True)

    # Handle quick prompt injection
    if "pending_quick" in st.session_state:
        user_msg = st.session_state.pop("pending_quick")
        st.session_state.chat_history.append({"role": "user", "content": user_msg})
        with st.spinner("Thinking…"):
            try:
                reply = chat_with_granite(
                    user_msg,
                    st.session_state.chat_history[:-1],
                    build_system_prompt(user_profile),
                )
            except Exception as e:
                reply = f"⚠️ {e}"
        st.session_state.chat_history.append({"role": "assistant", "content": reply})
        st.rerun()

    # Chat input — st.chat_input must be at page level, not inside columns
    if st.button("🗑 Clear chat", help="Clear conversation history"):
        st.session_state.chat_history = [{"role": "assistant", "content": JASON_WELCOME}]
        st.rerun()

    user_input = st.chat_input("Ask me about workouts, nutrition, or wellness…")

    if user_input:
        st.session_state.chat_history.append({"role": "user", "content": user_input})
        with st.spinner("Jason is thinking… 💪"):
            try:
                reply = chat_with_granite(
                    user_input,
                    st.session_state.chat_history[:-1],
                    build_system_prompt(user_profile),
                )
            except Exception as e:
                reply = f"⚠️ {e}"
        st.session_state.chat_history.append({"role": "assistant", "content": reply})
        st.rerun()

# ════════════════════════════════════════════════════════════════════
# PAGE 2 — WORKOUT PLANNER
# ════════════════════════════════════════════════════════════════════
elif page == "🏃 Workout Planner":
    from workout import get_workout_plan

    st.title("🏃 Workout Planner")
    st.caption("Get a personalised home workout plan from IBM Granite.")

    with st.form("workout_form"):
        col1, col2 = st.columns(2)
        with col1:
            level = st.selectbox(
                "Fitness Level",
                ["Beginner", "Intermediate", "Advanced"],
                index=1,
            )
            goal = st.selectbox(
                "Goal",
                ["General Fitness", "Weight Loss", "Muscle Gain", "Endurance", "Flexibility"],
            )
        with col2:
            duration = st.slider("Session Duration (minutes)", 10, 90, 30, step=5)
            equipment = st.selectbox(
                "Available Equipment",
                ["No Equipment", "Dumbbells", "Resistance Bands", "Full Gym"],
            )
        submitted = st.form_submit_button("🏋️ Generate Workout Plan", use_container_width=True)

    if submitted:
        with st.spinner("Creating your personalised workout…"):
            try:
                result = get_workout_plan(
                    fitness_level=level.lower(),
                    goal=goal.lower(),
                    duration=duration,
                    equipment=equipment.lower(),
                )
                st.session_state.workout_result = result
            except Exception as e:
                st.session_state.workout_result = f"⚠️ {e}"

    if st.session_state.workout_result:
        st.divider()
        st.markdown(
            f'<div class="result-box">{st.session_state.workout_result}</div>',
            unsafe_allow_html=True,
        )

# ════════════════════════════════════════════════════════════════════
# PAGE 3 — NUTRITION GUIDE
# ════════════════════════════════════════════════════════════════════
elif page == "🥗 Nutrition Guide":
    from nutrition import get_nutrition_advice

    st.title("🥗 Nutrition Guide")
    st.caption("Get a personalised meal plan and nutrition tips from IBM Granite.")

    with st.form("nutrition_form"):
        col1, col2 = st.columns(2)
        with col1:
            n_goal = st.selectbox(
                "Nutrition Goal",
                ["Balanced Diet", "Weight Loss", "Muscle Gain", "Energy Boost"],
            )
        with col2:
            n_calories = st.number_input(
                "Daily Calorie Target (optional, 0 = skip)",
                min_value=0,
                max_value=5000,
                value=0,
                step=50,
            )

        st.markdown("**Dietary Preferences / Restrictions**")
        rc1, rc2, rc3 = st.columns(3)
        veg  = rc1.checkbox("🌿 Vegetarian")
        vgn  = rc2.checkbox("🌱 Vegan")
        gf   = rc3.checkbox("🌾 Gluten-Free")
        df   = rc1.checkbox("🥛 Dairy-Free")
        lc   = rc2.checkbox("🍞 Low-Carb")
        hp   = rc3.checkbox("💪 High-Protein")

        submitted_n = st.form_submit_button("🥗 Get Nutrition Advice", use_container_width=True)

    if submitted_n:
        restrictions = []
        if veg: restrictions.append("vegetarian")
        if vgn: restrictions.append("vegan")
        if gf:  restrictions.append("gluten-free")
        if df:  restrictions.append("dairy-free")
        if lc:  restrictions.append("low-carb")
        if hp:  restrictions.append("high-protein")

        with st.spinner("Building your nutrition plan…"):
            try:
                result_n = get_nutrition_advice(
                    goal=n_goal.lower(),
                    restrictions=restrictions,
                    calories=int(n_calories) if n_calories > 0 else None,
                )
                st.session_state.nutrition_result = result_n
            except Exception as e:
                st.session_state.nutrition_result = f"⚠️ {e}"

    if st.session_state.nutrition_result:
        st.divider()
        st.markdown(
            f'<div class="result-box">{st.session_state.nutrition_result}</div>',
            unsafe_allow_html=True,
        )

# ════════════════════════════════════════════════════════════════════
# PAGE 4 — MOTIVATE ME
# ════════════════════════════════════════════════════════════════════
elif page == "⚡ Motivate Me":
    from motivation import get_motivational_tip

    st.title("⚡ Daily Motivation")
    st.caption("Your personalised motivational boost, powered by IBM Granite.")

    # Motivational card
    st.markdown(
        f'<div class="motivate-card">💪&nbsp;&nbsp;{st.session_state.tip_text}</div>',
        unsafe_allow_html=True,
    )

    if st.button("✨ Inspire Me!", use_container_width=True, type="primary"):
        with st.spinner("Finding your spark…"):
            tip = get_motivational_tip()
            st.session_state.tip_text = tip
        st.rerun()

    st.divider()

    # Streak tracker
    st.markdown("### 🔥 Activity Streak")
    col_streak, col_log = st.columns([1, 2])

    with col_streak:
        st.markdown(
            f'<div class="streak-badge">{st.session_state.streak}</div>'
            '<p style="color:#8b90b0;font-size:0.8rem;text-align:center;margin-top:6px;">days</p>',
            unsafe_allow_html=True,
        )

    with col_log:
        st.write("")
        if st.button("✅ Log Today's Activity", use_container_width=True):
            today = datetime.date.today().isoformat()
            if st.session_state.last_log_date == today:
                st.info("Already logged today! Come back tomorrow. 🔥")
            else:
                yesterday = (datetime.date.today() - datetime.timedelta(days=1)).isoformat()
                if st.session_state.last_log_date == yesterday:
                    st.session_state.streak += 1
                else:
                    st.session_state.streak = 1
                st.session_state.last_log_date = today
                st.success(f"🔥 {st.session_state.streak}-day streak! Keep it up!")
                st.rerun()

        st.caption("Log every day to build your streak. Missing a day resets it.")
