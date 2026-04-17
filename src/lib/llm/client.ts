import OpenAI from "openai";

import { env } from "@/lib/env";

const getClient = () =>
  new OpenAI({
    apiKey: env.llm.apiKey,
    baseURL: env.llm.baseUrl,
  });

export const generateSuggestionNarrative = async (input: {
  referencePalette: string[];
  targetPalette: string[];
  score: number;
  findings: string[];
  suggestions: string[];
}) => {
  if (!env.hasLlm) {
    return null;
  }

  const client = getClient();
  const completion = await client.chat.completions.create({
    model: env.llm.model,
    temperature: 0.2,
    messages: [
      {
        role: "system",
        content:
          "You are a concise internal design QA assistant. Respond in plain English for a designer. Keep the answer under 140 words and make it practical.",
      },
      {
        role: "user",
        content: [
          `Reference palette: ${input.referencePalette.join(", ")}`,
          `Target palette: ${input.targetPalette.join(", ")}`,
          `Match score: ${input.score}/100`,
          `Findings: ${input.findings.join(" | ")}`,
          `Suggested actions already generated: ${input.suggestions.join(" | ")}`,
          "Write one short summary paragraph and two short actionable recommendations.",
        ].join("\n"),
      },
    ],
  });

  return completion.choices[0]?.message?.content?.trim() || null;
};
