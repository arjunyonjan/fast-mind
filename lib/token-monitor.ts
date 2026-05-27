// DashScope/Qwen Token Usage Monitor
// Tracks and aggregates token consumption across API calls

export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  timestamp: string;
  model: string;
  requestId?: string;
}

export interface UsageSummary {
  totalCalls: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  totalTokens: number;
  byModel: Record<string, { calls: number; tokens: number }>;
  byDate: Record<string, { calls: number; tokens: number }>;
}

// In-memory store (for production, use MongoDB or Redis)
let usageLog: TokenUsage[] = [];

/**
 * Record token usage from a DashScope API response
 */
export function recordUsage(usage: TokenUsage): void {
  usageLog.push(usage);
  
  // Keep only last 10,000 entries to prevent memory bloat
  if (usageLog.length > 10000) {
    usageLog = usageLog.slice(-10000);
  }
}

/**
 * Get usage summary with optional date range filter
 */
export function getUsageSummary(startDate?: string, endDate?: string): UsageSummary {
  let filtered = usageLog;
  
  if (startDate) {
    filtered = filtered.filter(u => u.timestamp >= startDate);
  }
  if (endDate) {
    filtered = filtered.filter(u => u.timestamp <= endDate);
  }
  
  const summary: UsageSummary = {
    totalCalls: filtered.length,
    totalInputTokens: 0,
    totalOutputTokens: 0,
    totalTokens: 0,
    byModel: {},
    byDate: {},
  };
  
  for (const usage of filtered) {
    summary.totalInputTokens += usage.inputTokens;
    summary.totalOutputTokens += usage.outputTokens;
    summary.totalTokens += usage.totalTokens;
    
    // By model
    if (!summary.byModel[usage.model]) {
      summary.byModel[usage.model] = { calls: 0, tokens: 0 };
    }
    summary.byModel[usage.model].calls += 1;
    summary.byModel[usage.model].tokens += usage.totalTokens;
    
    // By date (YYYY-MM-DD)
    const date = usage.timestamp.split('T')[0];
    if (!summary.byDate[date]) {
      summary.byDate[date] = { calls: 0, tokens: 0 };
    }
    summary.byDate[date].calls += 1;
    summary.byDate[date].tokens += usage.totalTokens;
  }
  
  return summary;
}

/**
 * Get raw usage log entries
 */
export function getUsageLog(limit: number = 100): TokenUsage[] {
  return usageLog.slice(-limit).reverse();
}

/**
 * Clear usage log
 */
export function clearUsageLog(): void {
  usageLog = [];
}

/**
 * Extract token usage from DashScope API response
 */
export function extractUsageFromResponse(
  response: any,
  model: string
): TokenUsage | null {
  if (!response?.usage) return null;
  
  return {
    inputTokens: response.usage.input_tokens || 0,
    outputTokens: response.usage.output_tokens || 0,
    totalTokens: response.usage.total_tokens || 0,
    timestamp: new Date().toISOString(),
    model,
    requestId: response.request_id,
  };
}
