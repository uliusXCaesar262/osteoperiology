import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

interface BilingualSummary {
  en: string;
  it: string;
}

export async function generateBilingualSummary(
  title: string,
  authors: string[],
  journal: string,
  abstractText: string
): Promise<BilingualSummary> {
  const prompt = `You are a scientific communicator for a dental periodontology and implantology audience.
You write in a clear, essential style — no fluff, no redundancy. Think Alessandro Baricco applied to science: precise, elegant, direct.

Given this article:
Title: ${title}
Authors: ${authors.join(", ")}
Journal: ${journal}
Abstract: ${abstractText}

Generate TWO summaries — one in English, one in Italian. Each summary should be 300-500 words and include:
1. The clinical question or research problem
2. The key methodology
3. The main findings
4. The clinical relevance / take-home message

Write for an audience of periodontists, implantologists, and oral surgeons. Use appropriate technical terminology but keep the prose readable.

Respond ONLY with valid JSON in this exact format:
{
  "en": "English summary here...",
  "it": "Italian summary here..."
}`;

  const message = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2000,
    messages: [{ role: "user", content: prompt }],
  });

  const content = message.content[0];
  if (content.type !== "text") {
    throw new Error("Unexpected response type from Claude");
  }

  try {
    const parsed = JSON.parse(content.text);
    return {
      en: parsed.en || "",
      it: parsed.it || "",
    };
  } catch {
    // Try to extract JSON from the response
    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return { en: parsed.en || "", it: parsed.it || "" };
    }
    throw new Error("Failed to parse summary response");
  }
}
