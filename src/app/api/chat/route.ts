import { NextRequest, NextResponse } from "next/server";
import { PORTFOLIO_SYSTEM_PROMPT } from "@/lib/chat/portfolioConetxt";


const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama-3.3-70b-versatile";


type ChatMessage = {
    role: "user" | "assistant";
    content: string;
}


export async function POST(req: NextRequest){
    try {
        const apiKey = process.env.GROQ_API_KEY;
        if(!apiKey) {
            return NextResponse.json(
                {
                    error: "GROQ_API_KEY is not set",

                },{
                    status: 500,
                }
            );
        }



        const body = await req.json();
    const messages = body?.messages as ChatMessage[] | undefined;
    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Expected { messages: [{ role, content }] }" },
        { status: 400 },
      );
    }
    // Basic guardrails
    const last = messages[messages.length - 1];
    if (last.role !== "user" || !last.content?.trim()) {
      return NextResponse.json(
        { error: "Last message must be a non-empty user message" },
        { status: 400 },
      );
    }
    if (last.content.length > 2000) {
      return NextResponse.json(
        { error: "Message too long" },
        { status: 400 },
      );
    }
    // Keep last N turns to control token usage
    const recent = messages.slice(-10);
    const groqRes = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: "system", content: PORTFOLIO_SYSTEM_PROMPT },
          ...recent,
        ],
        temperature: 0.4,
        max_tokens: 512,
      }),
    });
    if (!groqRes.ok) {
      const errText = await groqRes.text();
    
      console.error("Groq error:", groqRes.status, errText);
      return NextResponse.json(
        { error: "LLM request failed" },
        { status: 502 },
      );
    }
    const data = await groqRes.json();
    const reply = data.choices?.[0]?.message?.content ?? "";
    return NextResponse.json({ reply });
  } catch (e) {
    console.error("chat route error:", e);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  
    }
}