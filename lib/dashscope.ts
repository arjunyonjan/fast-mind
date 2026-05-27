// DashScope API wrapper with automatic token tracking
import { recordUsage, extractUsageFromResponse } from '@/lib/token-monitor';

const DASHSCOPE_API_KEY = process.env.DASHSCOPE_API_KEY;
const DASHSCOPE_BASE_URL = 'https://dashscope.aliyuncs.com/api/v1';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatCompletionOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

/**
 * Call DashScope chat completion with automatic token tracking
 */
export async function chatCompletion(
  messages: ChatMessage[],
  options: ChatCompletionOptions = {}
) {
  const {
    model = 'qwen-turbo',
    temperature = 0.7,
    maxTokens,
    stream = false,
  } = options;

  if (!DASHSCOPE_API_KEY) {
    throw new Error('DASHSCOPE_API_KEY not set in environment');
  }

  const body: any = {
    model,
    input: { messages },
    parameters: {
      temperature,
      ...(maxTokens && { max_tokens: maxTokens }),
    },
  };

  const response = await fetch(`${DASHSCOPE_BASE_URL}/services/aigc/text-generation/generation`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${DASHSCOPE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();

  // Track token usage
  const usage = extractUsageFromResponse(data, model);
  if (usage) {
    recordUsage(usage);
  }

  return data;
}

/**
 * Track usage from a raw response (if you're calling the API directly)
 */
export function trackResponse(response: any, model: string) {
  const usage = extractUsageFromResponse(response, model);
  if (usage) {
    recordUsage(usage);
  }
}
