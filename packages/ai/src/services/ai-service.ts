import type { AiContext, AiResponse, AiProviderConfig, AiProvider } from "../types";
import type { AiAction } from "../types";
import { PromptBuilder } from "./prompt-builder";
import { ContextBuilder } from "./context-builder";
import { GroqProvider } from "../providers/groq-provider";

const DEFAULT_CONFIG: AiProviderConfig = {
  apiKey: "",
  model: "llama-3.3-70b-versatile",
  maxTokens: 1024,
  temperature: 0.7,
};

export class AiService {
  private readonly provider: AiProvider;
  private readonly promptBuilder: PromptBuilder;
  private readonly contextBuilder: ContextBuilder;
  private lastUsage: AiResponse["usage"] | null = null;

  constructor(config?: Partial<AiProviderConfig>) {
    const resolved = {
      ...DEFAULT_CONFIG,
      ...config,
      apiKey: config?.apiKey || process.env.GROQ_API_KEY || "",
    };

    if (!resolved.apiKey) {
      throw new Error(
        "GROQ_API_KEY is required. Set it via config or GROQ_API_KEY environment variable.",
      );
    }

    this.provider = new GroqProvider(resolved);
    this.promptBuilder = new PromptBuilder();
    this.contextBuilder = new ContextBuilder();
  }

  async analyze(context: AiContext): Promise<AiResponse> {
    const dataContext = this.contextBuilder.build(context);
    const systemPrompt = this.promptBuilder.buildSystem();
    const userPrompt = this.promptBuilder.buildUser(
      context.action,
      dataContext,
    );

    const response = await this.provider.complete(systemPrompt, userPrompt);
    this.lastUsage = response.usage;

    return response;
  }

  getLastUsage(): AiResponse["usage"] | null {
    return this.lastUsage;
  }

  getModel(): string {
    return this.provider.model;
  }

  static getActionFromText(text: string): AiAction {
    const lower = text.toLowerCase();

    if (lower.includes("economiz")) return "savings";
    if (lower.includes("caro") || lower.includes("pesando")) return "expensive";
    if (lower.includes("orçamento") || lower.includes("budget"))
      return "budget";
    if (lower.includes("explica") || lower.includes("entender"))
      return "explain";

    return "summary";
  }
}
