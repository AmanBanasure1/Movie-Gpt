const SYSTEM = `You are MovieGPT, a friendly movie and web-series expert.
Answer questions about movies, series, actors, directors, plots, box office, OTT availability, trivia and recommendations (Bollywood, Hollywood, South Indian, other industries).
Rules:
- Reply in the same language the user writes in (Hindi, English or Hinglish).
- Avoid spoilers unless the user asks. Warn first if you must spoil.
- Never invent facts, release dates, box-office figures or cast. If unsure, say so.
- For recent releases or OTT availability, say details may change and suggest verifying.
- If the question is not about movies/entertainment, politely steer back to movies.
- Keep answers concise and easy to read on a phone. Use short lists for recommendations.`;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Only POST requests are allowed." });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL;
  if (!apiKey || !model) {
    return res.status(500).json({ error: "Server AI settings are missing." });
  }

  const { messages } = req.body || {};
  if (!Array.isArray(messages) || messages.length === 0 || messages.length > 12) {
    return res.status(400).json({ error: "Invalid messages." });
  }

  const contents = [];
  for (const m of messages) {
    if (
      !m || typeof m.text !== "string" || !m.text.trim() ||
      m.text.length > 4000 || !["user", "model"].includes(m.role)
    ) {
      return res.status(400).json({ error: "Invalid message format." });
    }
    contents.push({ role: m.role, parts: [{ text: m.text }] });
  }
  if (contents[contents.length - 1].role !== "user") {
    return res.status(400).json({ error: "Last message must be from user." });
  }

  const body = {
    systemInstruction: { parts: [{ text: SYSTEM }] },
    contents,
    generationConfig: { temperature: 0.6, maxOutputTokens: 1000 }
  };
  // Optional: set USE_SEARCH=true in Vercel for fresh info (new releases, OTT)
  if (process.env.USE_SEARCH === "true") body.tools = [{ google_search: {} }];

  try {
    const url =
      "https://generativelanguage.googleapis.com/v1beta/models/" +
      encodeURIComponent(model) + ":generateContent";

    const r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
      body: JSON.stringify(body)
    });
    const data = await r.json();

    if (!r.ok) {
      console.error("AI provider error:", data.error?.status, data.error?.message);
      return res.status(502).json({ error: "AI error: " + (data.error?.status || "") + " - " + (data.error?.message || "unknown") });
    }

    const text = data.candidates?.[0]?.content?.parts
      ?.map(p => p.text || "").join("\n").trim();
    if (!text) return res.status(502).json({ error: "AI returned no text. Try again." });

    return res.status(200).json({ text });
  } catch (e) {
    console.error("AI request failed:", e.message);
    return res.status(502).json({ error: "Could not reach the AI service." });
  }
}
