import { NextResponse } from "next/server";
import { getUsageSummary } from "@/lib/token-monitor";

export async function GET() {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  const STARTING_BALANCE = parseFloat(process.env.STARTING_BALANCE || "5.00");
  
  if (!apiKey) {
    return NextResponse.json({
      configured: false,
      online: false,
      error: "DEEPSEEK_API_KEY not configured"
    });
  }

  try {
    const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [{ role: "user", content: "test" }],
        max_tokens: 1
      }),
      signal: AbortSignal.timeout(5000)
    });

    const summary = getUsageSummary();
    const totalTokens = summary.totalTokens;
    const estimatedCost = (totalTokens / 1_000_000) * 0.20;
    const estimatedBalance = Math.max(0, STARTING_BALANCE - estimatedCost);

    return NextResponse.json({
      configured: true,
      online: response.ok,
      balance: parseFloat(estimatedBalance.toFixed(2)),
      totalTokensUsed: totalTokens,
      lastCheck: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({
      configured: true,
      online: false,
      balance: null,
      error: error instanceof Error ? error.message : "Connection failed"
    });
  }
}