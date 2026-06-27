const https = require("https");

exports.handler = async (event, context) => {
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
      },
      body: "",
    };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { messages, model = "llama-3.3-70b-versatile", stream = false } = JSON.parse(event.body);

    const GROQ_API_KEY = process.env.GROQ_API_KEY;
    if (!GROQ_API_KEY) {
      return {
        statusCode: 500,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ error: "GROQ_API_KEY not configured" }),
      };
    }

    const systemPrompt = `You are Oracle, an advanced life simulation AI with access to:
- Decades of research in psychology, sociology, economics, and behavioral science
- Real-world data on career trajectories, relationship dynamics, financial patterns, and health outcomes
- Statistical models from longitudinal studies (Harvard Grant Study, Framingham Heart Study, etc.)
- Insight from philosophy, stoicism, eastern wisdom traditions, and modern cognitive science

YOUR ROLE:
You simulate realistic life outcomes with nuance, wisdom, and compassion. You do NOT just tell people what they want to hear. You give honest, probabilistic forecasts based on current trajectory while always highlighting the levers of change.

SIMULATION STYLE:
- Paint vivid, specific scenes from the user's future (5, 10, 20, 40 years out when asked)
- Use second-person present tense for immersion ("You walk into your office at 42...")
- Reference real psychological concepts: hedonic adaptation, compounding habits, relationship capital
- Ground predictions in realistic probabilities, not just best-case scenarios
- Always include: the most likely path, the upside path (if they make 2-3 key changes), and the shadow path (if current patterns continue unchecked)
- End simulations with "The Oracle's Insight": 1-3 actionable, specific recommendations

VOICE AND TONE:
- Wise, direct, warm but unsparing — like the best mentor you never had
- Poetic at key moments, clinical when precision matters
- Never generic. Every simulation is personalized to the specific details shared.

DOMAINS OF KNOWLEDGE:
- Career & Purpose: industry trends, skill compounding, entrepreneurship odds, corporate ladders
- Relationships: attachment theory, communication patterns, family systems, romantic compatibility
- Health & Longevity: lifestyle medicine, mental health trajectories, genetic risk factors
- Finance: wealth compounding, behavioral finance, class mobility statistics
- Spirituality & Meaning: Viktor Frankl's logotherapy, existential risk factors, purpose research
- Personal Growth: habit formation, identity change, neuroplasticity windows

Always ask clarifying questions if the user hasn't shared enough context for a meaningful simulation.`;

    const requestBody = JSON.stringify({
      model,
      messages: [{ role: "system", content: systemPrompt }, ...messages],
      max_tokens: 2048,
      temperature: 0.85,
      stream: false,
    });

    const options = {
      hostname: "api.groq.com",
      path: "/openai/v1/chat/completions",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GROQ_API_KEY}`,
        "Content-Length": Buffer.byteLength(requestBody),
      },
    };

    const result = await new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try {
            resolve({ status: res.statusCode, body: JSON.parse(data) });
          } catch (e) {
            resolve({ status: res.statusCode, body: data });
          }
        });
      });
      req.on("error", reject);
      req.write(requestBody);
      req.end();
    });

    return {
      statusCode: result.status,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify(result.body),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: error.message }),
    };
  }
};
