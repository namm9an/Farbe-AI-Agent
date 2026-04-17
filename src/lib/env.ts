const required = (value: string | undefined, key: string) => {
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
};

export const env = {
  databaseUrl: process.env.DATABASE_URL ?? "data/farbe.db",
  llmBaseUrl: process.env.E2E_LLM_BASE_URL,
  llmApiKey: process.env.E2E_LLM_API_KEY,
  llmModel: process.env.E2E_LLM_MODEL ?? "Qwen/Qwen3-VL-8B-Instruct",
  get hasLlm() {
    return Boolean(this.llmBaseUrl && this.llmApiKey);
  },
  get llm() {
    return {
      baseUrl: required(this.llmBaseUrl, "E2E_LLM_BASE_URL"),
      apiKey: required(this.llmApiKey, "E2E_LLM_API_KEY"),
      model: this.llmModel,
    };
  },
};
