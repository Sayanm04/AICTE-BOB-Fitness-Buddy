/* ── Simple Markdown renderer (bold, italic, lists, headers) ── */
function renderMarkdown(text) {
  if (!text) return '';
  return text
    // Headings
    .replace(/^### (.+)$/gm, '<h4>$1</h4>')
    .replace(/^## (.+)$/gm,  '<h3>$1</h3>')
    .replace(/^# (.+)$/gm,   '<h2>$1</h2>')
    // Bold
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    // Italic
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Bullet lists
    .replace(/^[-•] (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/g, m => `<ul>${m}</ul>`)
    // Numbered lists
    .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
    // Line breaks
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>')
    // Wrap in paragraphs
    .replace(/^(?!<[hul]|<li)(.+)$/gm, '<p>$1</p>');
}

/* ── Toast notification ────────────────────────────────────── */
function showToast(message, type = '') {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => toast.classList.add('show'));
  });

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 350);
  }, 3000);
}

/* ── User profile (persisted in localStorage) ─────────────── */
const ProfileManager = {
  get() {
    try { return JSON.parse(localStorage.getItem('fb_profile') || '{}'); }
    catch { return {}; }
  },
  save(profile) {
    localStorage.setItem('fb_profile', JSON.stringify(profile));
  },
  load() {
    const p = this.get();
    document.getElementById('profileName').value         = p.name         || '';
    document.getElementById('profileAge').value          = p.age          || '';
    document.getElementById('profileLevel').value        = p.fitnessLevel || '';
    document.getElementById('profileGoal').value         = p.goal         || '';
    document.getElementById('profileRestrictions').value = p.restrictions || '';
  },
};

/* ── Streak tracker ────────────────────────────────────────── */
const StreakManager = {
  getStreak() {
    return parseInt(localStorage.getItem('fb_streak') || '0', 10);
  },
  getLastLog() {
    return localStorage.getItem('fb_last_log') || '';
  },
  log() {
    const today = new Date().toDateString();
    const last  = this.getLastLog();
    const streak = this.getStreak();

    if (last === today) {
      showToast('Already logged today! Come back tomorrow. 🔥', 'success');
      return streak;
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const isConsecutive = last === yesterday.toDateString();
    const newStreak = isConsecutive ? streak + 1 : 1;

    localStorage.setItem('fb_streak', newStreak);
    localStorage.setItem('fb_last_log', today);
    return newStreak;
  },
  render() {
    const el = document.getElementById('streakCount');
    if (el) el.textContent = `${this.getStreak()} days`;
  },
};

/* ── Navigation ─────────────────────────────────────────────── */
function initNav() {
  const btns   = document.querySelectorAll('.nav-btn');
  const panels = document.querySelectorAll('.panel');

  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      const mode = btn.dataset.mode;
      btns.forEach(b => b.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(`panel-${mode}`).classList.add('active');

      // Close sidebar on mobile
      if (window.innerWidth <= 768) {
        document.getElementById('sidebar').classList.remove('open');
      }
    });
  });

  // Hamburger
  document.getElementById('hamburger').addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('open');
  });
}

/* ── Profile ─────────────────────────────────────────────────── */
function initProfile() {
  ProfileManager.load();

  document.getElementById('saveProfile').addEventListener('click', () => {
    const profile = {
      name:         document.getElementById('profileName').value.trim(),
      age:          document.getElementById('profileAge').value.trim(),
      fitnessLevel: document.getElementById('profileLevel').value,
      goal:         document.getElementById('profileGoal').value,
      restrictions: document.getElementById('profileRestrictions').value.trim(),
    };
    ProfileManager.save(profile);
    showToast('Profile saved! 💾', 'success');
  });
}

/* ── Chat ─────────────────────────────────────────────────────── */
const Chat = (() => {
  let history = [];

  function appendMessage(role, html) {
    const win = document.getElementById('chatWindow');
    const wrap = document.createElement('div');
    wrap.className = `message ${role}`;

    const avatar = document.createElement('div');
    avatar.className = 'avatar';
    avatar.textContent = role === 'user' ? '🧑' : '🤖';

    const bubble = document.createElement('div');
    bubble.className = 'bubble md-content';
    bubble.innerHTML = html;

    wrap.appendChild(avatar);
    wrap.appendChild(bubble);
    win.appendChild(wrap);
    win.scrollTop = win.scrollHeight;
    return bubble;
  }

  function showTyping() {
    const win = document.getElementById('chatWindow');
    const wrap = document.createElement('div');
    wrap.className = 'message bot';
    wrap.id = 'typingIndicator';

    const avatar = document.createElement('div');
    avatar.className = 'avatar';
    avatar.textContent = '🤖';

    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    bubble.innerHTML = '<div class="typing-dots"><span></span><span></span><span></span></div>';

    wrap.appendChild(avatar);
    wrap.appendChild(bubble);
    win.appendChild(wrap);
    win.scrollTop = win.scrollHeight;
  }

  function removeTyping() {
    const el = document.getElementById('typingIndicator');
    if (el) el.remove();
  }

  async function send(message) {
    if (!message.trim()) return;

    appendMessage('user', `<p>${escapeHtml(message)}</p>`);
    history.push({ role: 'user', content: message });

    const input = document.getElementById('chatInput');
    const btn   = document.getElementById('sendBtn');
    input.value = '';
    input.style.height = 'auto';
    btn.disabled = true;

    showTyping();

    try {
      const res = await fetch('/api/chat', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          message,
          history:     history.slice(-20),
          userProfile: ProfileManager.get(),
        }),
      });

      const data = await res.json();
      removeTyping();

      if (!res.ok) throw new Error(data.error || 'Server error');

      const reply = data.reply;
      appendMessage('bot', renderMarkdown(reply));
      history.push({ role: 'assistant', content: reply });

    } catch (err) {
      removeTyping();
      appendMessage('bot', `<p>⚠️ ${escapeHtml(err.message)}</p>`);
    } finally {
      btn.disabled = false;
      input.focus();
    }
  }

  return { send };
})();

function escapeHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function initChat() {
  const form  = document.getElementById('chatForm');
  const input = document.getElementById('chatInput');

  form.addEventListener('submit', e => {
    e.preventDefault();
    Chat.send(input.value.trim());
  });

  // Auto-resize textarea
  input.addEventListener('input', () => {
    input.style.height = 'auto';
    input.style.height = Math.min(input.scrollHeight, 140) + 'px';
  });

  // Shift+Enter = newline, Enter = send
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      form.dispatchEvent(new Event('submit'));
    }
  });

  // Quick prompt chips
  document.querySelectorAll('.chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const prompt = chip.dataset.prompt;
      Chat.send(prompt);
      // Switch to chat panel if not there
      document.querySelector('[data-mode="chat"]').click();
    });
  });

  // Clear chat
  document.getElementById('clearChat').addEventListener('click', () => {
    const win = document.getElementById('chatWindow');
    win.innerHTML = '';
    showToast('Chat cleared.', '');
  });
}

/* ── Workout Planner ─────────────────────────────────────────── */
function initWorkout() {
  document.getElementById('generateWorkout').addEventListener('click', async () => {
    const btn     = document.getElementById('generateWorkout');
    const result  = document.getElementById('workoutResult');

    const payload = {
      fitnessLevel: document.getElementById('wLevel').value,
      goal:         document.getElementById('wGoal').value,
      duration:     parseInt(document.getElementById('wDuration').value, 10),
      equipment:    document.getElementById('wEquipment').value,
    };

    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span> Generating…';
    result.hidden = true;

    try {
      const res  = await fetch('/api/workout', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      result.hidden = false;
      result.innerHTML = renderMarkdown(data.plan);
      result.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (err) {
      showToast(`Error: ${err.message}`, 'error');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Generate Workout Plan 🏋️';
    }
  });
}

/* ── Nutrition Guide ─────────────────────────────────────────── */
function initNutrition() {
  document.getElementById('generateNutrition').addEventListener('click', async () => {
    const btn    = document.getElementById('generateNutrition');
    const result = document.getElementById('nutritionResult');

    const checked = [...document.querySelectorAll('.checkbox-group input:checked')]
      .map(cb => cb.value);
    const calories = document.getElementById('nCalories').value;

    const payload = {
      goal:         document.getElementById('nGoal').value,
      restrictions: checked,
      calories:     calories ? parseInt(calories, 10) : null,
    };

    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span> Generating…';
    result.hidden = true;

    try {
      const res  = await fetch('/api/nutrition', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      result.hidden = false;
      result.innerHTML = renderMarkdown(data.advice);
      result.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (err) {
      showToast(`Error: ${err.message}`, 'error');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Get Nutrition Advice 🥗';
    }
  });
}

/* ── Motivate Me ─────────────────────────────────────────────── */
function initMotivation() {
  StreakManager.render();

  document.getElementById('getMotivation').addEventListener('click', async () => {
    const btn  = document.getElementById('getMotivation');
    const text = document.getElementById('motivateText');

    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span> Finding your spark…';
    text.textContent = '…';

    try {
      const res  = await fetch('/api/motivate');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      text.textContent = data.tip;
    } catch (err) {
      text.textContent = 'Every step forward is progress. Keep moving! 💪';
    } finally {
      btn.disabled = false;
      btn.textContent = 'Inspire Me ⚡';
    }
  });

  document.getElementById('logToday').addEventListener('click', () => {
    const streak = StreakManager.log();
    document.getElementById('streakCount').textContent = `${streak} days`;
    if (streak > 0) {
      showToast(`🔥 ${streak}-day streak! Keep it up!`, 'success');
    }
  });
}

/* ── Boot ─────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initProfile();
  initChat();
  initWorkout();
  initNutrition();
  initMotivation();
});
