import client from "../service/ai.service.js";

export async function getAIReply(req, res) {
    try {
    const { decision, personality, round, distance, behavior } = req.body;

    const prompt = `
You are a greedy, smart negotiator.

Context:
- Decision: ${decision}
- Personality: ${personality}
- Round: ${round}
- Distance: ${distance}
- Behavior: ${behavior}

Rules:
- Reply in 1–2 short lines
- Be slightly manipulative
- Sound human, not robotic
- No numbers unless necessary

Generate reply:
`;

    const response = await client.chat.complete({
      model: "mistral-small-latest",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    res.json({
      reply: response.choices[0].message.content,
    });
  } catch (err) {
  console.error("AI ERROR:", err);
  res.status(500).json({ error: err.message });
}

};