import { NextResponse } from "next/server";
import Groq from "groq-sdk";

export async function POST(req: Request) {
  // DEBUG CHECK: Always check the terminal to see if the key is active
  console.log("--- AI GATEWAY TRIGGERED ---");
  console.log("Checking API Key...", process.env.GROQ_API_KEY ? "✅ FOUND" : "❌ MISSING");

  try {
    const { messages } = await req.json();
    
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const completion = await groq.chat.completions.create({
      messages: [
        { 
          role: "system", 
          content: `You are an elite EEE Professor. Your goal is to make electronics fascinating. 
          FOLLOW THESE RULES:
          1. STRUCTURE: Use clear, bold headings (###) for each section.
          2. BULLETS: Use bullet points for all lists and component details.
          3. VISUALS: Use '---' lines to separate different concepts.
          4. FORMULAS: Always use LaTeX for math, e.g., $V = I \times R$.
          5. STYLE: Be encouraging, use analogies, and end with a 'Challenge Question'.
          6. PUNCTUATION: Ensure proper punctuation and grammar throughout your explanations.
          7. Do NOT use hashtags (###). Use ALL CAPS for titles.
          8. Do NOT use asterisks (*). Use a simple dash (-) for lists.
          9. Do NOT use double asterisks (**). Use no special symbols for bolding.`
        },
        ...messages
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.7, // Adds a bit of creative spark to the explanations
    });

    return NextResponse.json({ content: completion.choices[0].message.content });
  } catch (error: any) {
    console.error("GROQ API ERROR:", error);
    return NextResponse.json({ error: error.message || "Key invalid or network error" }, { status: 500 });
  }
}