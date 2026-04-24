type GeminiTextPart = { text: string };

type GeminiGenerateOptions = {
  systemInstruction: string;
  contents: Array<{
    role: "user" | "model";
    parts: GeminiTextPart[];
  }>;
  temperature?: number;
  maxOutputTokens?: number;
  responseMimeType?: "application/json" | "text/plain";
};

function getGeminiConfig() {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  const model = process.env.GEMINI_MODEL?.trim() || "gemini-2.5-flash";

  if (!apiKey) {
    return null;
  }

  return { apiKey, model };
}

function buildGeminiUrl(model: string, apiKey: string) {
  return `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
}

function extractGeminiText(payload: any) {
  const parts = payload?.candidates?.[0]?.content?.parts;
  if (!Array.isArray(parts)) {
    return "";
  }

  return parts
    .map((part) => (typeof part?.text === "string" ? part.text : ""))
    .join("")
    .trim();
}

export function extractJsonObject(raw: string | null | undefined) {
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch {
    const start = raw.indexOf("{");
    const end = raw.lastIndexOf("}");
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(raw.slice(start, end + 1));
      } catch {
        return null;
      }
    }

    return null;
  }
}

export async function generateGeminiText(options: GeminiGenerateOptions) {
  const config = getGeminiConfig();
  if (!config) {
    throw new Error("Gemini API key is not configured.");
  }

  const response = await fetch(buildGeminiUrl(config.model, config.apiKey), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{ text: options.systemInstruction }],
      },
      contents: options.contents,
      generationConfig: {
        temperature: options.temperature ?? 0.4,
        maxOutputTokens: options.maxOutputTokens ?? 1024,
        responseMimeType: options.responseMimeType ?? "text/plain",
      },
    }),
  });

  const rawBody = await response.text();

  if (!response.ok) {
    throw new Error(`Gemini API error (${response.status}): ${rawBody}`);
  }

  let parsed: unknown = null;
  try {
    parsed = rawBody ? JSON.parse(rawBody) : null;
  } catch {
    parsed = null;
  }

  const text = extractGeminiText(parsed);

  if (!text) {
    throw new Error("Gemini API returned an empty response.");
  }

  return text;
}

export async function generateGeminiJson(options: GeminiGenerateOptions) {
  const text = await generateGeminiText({
    ...options,
    responseMimeType: "application/json",
  });

  const parsed = extractJsonObject(text);
  if (!parsed) {
    throw new Error("Gemini API returned invalid JSON.");
  }

  return parsed;
}
