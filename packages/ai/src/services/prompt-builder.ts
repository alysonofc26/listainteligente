import type { AiAction } from "../types";
import { SYSTEM_PROMPT } from "../prompts/system-prompt";

const ACTION_LABELS: Record<AiAction, string> = {
  summary: "Análise geral da compra",
  savings: "Sugestões de economia",
  expensive: "Identificação de produtos mais caros",
  budget: "Análise de orçamento",
  explain: "Explicação detalhada da compra",
};

const ACTION_INSTRUCTIONS: Record<AiAction, string> = {
  summary: `Analise a lista de compras do usuário de forma geral.
Destaque o valor total, quantidade de itens, e dê uma visão geral dos gastos.
Identifique padrões e categorias que mais pesam no orçamento.`,

  savings: `Com base nos preços fornecidos, sugira maneiras específicas de economizar.
Destaque os produtos com maior potencial de economia.
Sugira alternativas ou ajustes de quantidade quando fizer sentido.
Nunca sugira substituições por produtos que não existem nos dados.`,

  expensive: `Identifique os itens que mais impactam o valor total da compra.
Liste os produtos mais caros em ordem decrescente.
Explique por que cada um pesa no orçamento (preço unitário, quantidade, etc.).`,

  budget: `Compare o total da compra com o orçamento informado pelo usuário.
Se o total exceder o orçamento, sugira onde cortar.
Se estiver dentro, destaque a margem disponível.
Se não houver orçamento informado, pergunte se o usuário quer definir um.`,

  explain: `Explique a compra de forma clara e detalhada.
Mostre o breakdown por categorias, os itens mais relevantes,
e dê uma avaliação geral sobre se a compra está equilibrada.`,
};

export class PromptBuilder {
  buildSystem(): string {
    return SYSTEM_PROMPT;
  }

  buildUser(
    action: AiAction,
    context: string,
  ): string {
    const header = `## ${ACTION_LABELS[action]}`;
    const instruction = ACTION_INSTRUCTIONS[action];

    return `${header}

${instruction}

## Dados da lista de compras

${context}

Com base APENAS nos dados acima, responda à solicitação do usuário.`;
  }
}
