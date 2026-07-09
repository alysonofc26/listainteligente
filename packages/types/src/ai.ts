export interface AISuggestion {
  type: "substitution" | "savings_tip" | "category_suggestion";
  title: string;
  description: string;
  savings_amount?: number;
  confidence: number;
}

export interface AISubstitution {
  original_product: string;
  suggested_product: string;
  savings_amount: number;
  reason: string;
}

export interface AIAnalysis {
  summary: string;
  suggestions: AISuggestion[];
  substitutions: AISubstitution[];
  total_potential_savings: number;
}
