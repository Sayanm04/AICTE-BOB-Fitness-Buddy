# 🏋️ Fitness Buddy — AI-Powered Health & Fitness Coach

> **IBM Internship Project — Problem Statement #13**
> Powered by **IBM Granite** on **watsonx.ai** (IBM Cloud Lite)

---

## 📋 Overview

Fitness Buddy is a conversational AI health and fitness coach that helps users lead healthier lives through personalised guidance. It uses **IBM Granite (`ibm/granite-3-8b-instruct`)** via the **watsonx.ai** API to provide intelligent, real-time responses.

### Core Features
| Feature | Description |
|---|---|
| 💬 **AI Chat** | Conversational fitness & wellness Q&A powered by IBM Granite |
| 🏃 **Workout Planner** | Personalised home workout plans based on fitness level, goal & equipment |
| 🥗 **Nutrition Guide** | Tailored meal ideas and daily nutrition advice |
| ⚡ **Daily Motivation** | AI-generated motivational boosts and a streak tracker |
| 👤 **User Profile** | Persistent profile for personalised responses |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **AI Model** | IBM Granite 3 8B Instruct (`ibm/granite-3-8b-instruct`) |
| **AI Platform** | IBM watsonx.ai (IBM Cloud Lite) |
| **Backend** | Node.js + Express |
| **Frontend** | Vanilla HTML5 / CSS3 / JavaScript (no framework) |
| **Authentication** | IBM Cloud IAM API Key |

---

## 🚀 Quick Start

### Prerequisites
- Node.js ≥ 18
- An [IBM Cloud account](https://cloud.ibm.com/registration) (free Lite tier works)
- A [watsonx.ai](https://dataplatform.cloud.ibm.com/) project

### 1. Get IBM Cloud Credentials

1. Go to [IBM Cloud](https://cloud.ibm.com) → **Manage → Access (IAM) → API Keys**
2. Click **Create an IBM Cloud API key** → copy it
3. Go to [watsonx.ai](https://dataplatform.cloud.ibm.com/) → open your project
4. Click **Manage → General** → copy the **Project ID**

### 2. Configure `.env`

Open the `.env` file in the project root and fill in your credentials:

```env
IBM_API_KEY=your_actual_api_key_here
WATSONX_URL=https://us-south.ml.cloud.ibm.com
WATSONX_PROJECT_ID=your_actual_project_id_here
GRANITE_MODEL_ID=ibm/granite-3-8b-instruct
PORT=3000
```

### 3. Install & Run

```bash
npm install
npm start
```

Open your browser at **http://localhost:3000**

For development with auto-restart:
```bash
npm run dev
```

---

## 📁 Project Structure

```
fitness-buddy/
├── server.js                    # Express server & API routes
├── package.json
├── .env                         # IBM credentials (never commit!)
├── .gitignore
│
├── src/
│   ├── services/
│   │   └── graniteService.js    # IBM Granite / watsonx.ai client
│   ├── prompts/
│   │   └── systemPrompt.js      # Fitness Buddy AI persona
│   └── modules/
│       ├── workout.js           # Workout plan generator
│       ├── nutrition.js         # Nutrition advice generator
│       └── motivation.js        # Motivational tip generator
│
└── public/                      # Static frontend
    ├── index.html
    ├── css/
    │   └── style.css
    └── js/
        └── app.js
```

---

## 🌐 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/chat` | Main AI chat (with conversation history) |
| `POST` | `/api/workout` | Generate a workout plan |
| `POST` | `/api/nutrition` | Get nutrition advice |
| `GET` | `/api/motivate` | Get a motivational tip |
| `GET` | `/api/health` | Health check |

### Example — Chat Request
```json
POST /api/chat
{
  "message": "Give me a 20-minute beginner workout",
  "history": [],
  "userProfile": { "fitnessLevel": "beginner", "goal": "weight loss" }
}
```

---

## 🔒 Security Notes

- **Never commit `.env`** — it is listed in `.gitignore`
- For production, use IBM Cloud Secrets Manager or environment variables injected by your hosting platform
- The API key grants access to your IBM Cloud account — treat it like a password

---

## 📄 License

MIT — see `LICENSE` for details.

---

*Built with ❤️ using IBM Granite on watsonx.ai*
