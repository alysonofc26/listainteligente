import Groq from "groq-sdk";
import type { AiProvider, AiProviderConfig, AiResponse } from "../types";

export class GroqProvider implements AiProvider {
  readonly model: string;
  private readonly client: Groq;
  private readonly config: AiProviderConfig;

  constructor(config: AiProviderConfig) {
    this.config = config;
    this.model = config.model;
    this.client = new Groq({ apiKey: config.apiKey });
  }

  async complete(
    systemPrompt: string,
    userPrompt: string,
  ): Promise<AiResponse> {
    const completion = await this.client.chat.completions.create({
      model: this.model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      max_tokens: this.config.maxTokens,
      temperature: this.config.temperature,
    });

    const choice = completion.choices[0];
    const content = choice?.message?.content ?? "";
    const usage = completion.usage;

    return {
      content,
      model: this.model,
      usage: {
        promptTokens: usage?.prompt_tokens ?? 0,
        completionTokens: usage?.completion_tokens ?? 0,
        totalTokens: usage?.total_tokens ?? 0,
      },
    };
  }
}
