'use strict';

const { WatsonxAiMlVml_v1 } = require('@ibm-cloud/watsonx-ai');
const { IamAuthenticator } = require('ibm-cloud-sdk-core');

// ── Initialise IBM Granite client (singleton) ─────────────────────
let _client = null;

function getClient() {
  if (_client) return _client;

  if (!process.env.IBM_API_KEY || process.env.IBM_API_KEY === 'your_ibm_cloud_api_key_here') {
    throw new Error(
      'IBM_API_KEY is not set. Add your key to the .env file.\n' +
      'Get one at: https://cloud.ibm.com → Manage → Access (IAM) → API keys'
    );
  }
  if (!process.env.WATSONX_PROJECT_ID || process.env.WATSONX_PROJECT_ID === 'your_watsonx_project_id_here') {
    throw new Error(
      'WATSONX_PROJECT_ID is not set. Add your project ID to the .env file.\n' +
      'Find it at: https://dataplatform.cloud.ibm.com → Your project → Manage → General'
    );
  }

  _client = new WatsonxAiMlVml_v1({
    authenticator: new IamAuthenticator({ apikey: process.env.IBM_API_KEY }),
    serviceUrl: process.env.WATSONX_URL || 'https://us-south.ml.cloud.ibm.com',
    version: '2024-05-31',
  });

  return _client;
}

// ── Core text generation ──────────────────────────────────────────

/**
 * Sends a conversation to IBM Granite and returns the assistant reply.
 *
 * @param {string}   userMessage   - Latest user message
 * @param {Array}    history       - [{role:'user'|'assistant', content:string}]
 * @param {string}   systemPrompt  - System-level instructions
 * @returns {Promise<string>}      - Assistant reply text
 */
async function chatWithGranite(userMessage, history = [], systemPrompt = '') {
  const client = getClient();

  // Build messages array for the chat API
  const messages = [];

  if (systemPrompt) {
    messages.push({ role: 'system', content: systemPrompt });
  }

  // Include last 10 turns of history to stay within token budget
  const recentHistory = history.slice(-10);
  for (const turn of recentHistory) {
    if (turn.role && turn.content) {
      messages.push({ role: turn.role, content: turn.content });
    }
  }

  messages.push({ role: 'user', content: userMessage });

  const params = {
    modelId: process.env.GRANITE_MODEL_ID || 'ibm/granite-3-8b-instruct',
    projectId: process.env.WATSONX_PROJECT_ID,
    messages,
    parameters: {
      max_new_tokens: 800,
      min_new_tokens: 20,
      temperature: 0.7,
      top_p: 0.9,
      repetition_penalty: 1.1,
    },
  };

  const response = await client.textChat(params);

  // Extract reply text from the response structure
  const choice = response?.result?.choices?.[0];
  const reply =
    choice?.message?.content ||
    choice?.text ||
    'I could not generate a response. Please try again.';

  return reply.trim();
}

/**
 * Convenience wrapper for single-turn generation (no chat history needed).
 *
 * @param {string} prompt - Full prompt text
 * @returns {Promise<string>}
 */
async function generateText(prompt) {
  const client = getClient();

  const params = {
    modelId: process.env.GRANITE_MODEL_ID || 'ibm/granite-3-8b-instruct',
    projectId: process.env.WATSONX_PROJECT_ID,
    input: prompt,
    parameters: {
      max_new_tokens: 600,
      temperature: 0.6,
      top_p: 0.9,
      repetition_penalty: 1.1,
    },
  };

  const response = await client.generateText(params);
  const text = response?.result?.results?.[0]?.generated_text || '';
  return text.trim();
}

module.exports = { chatWithGranite, generateText };
