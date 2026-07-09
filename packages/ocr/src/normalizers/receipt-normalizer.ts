import type { ReceiptItem } from "../types";

type UnitMapping = Record<string, string>;

const UNIT_MAP: UnitMapping = {
  kg: "kg",
  quilograma: "kg",
  quilo: "kg",
  g: "g",
  grama: "g",
  l: "l",
  litro: "l",
  ml: "ml",
  mililitro: "ml",
  un: "un",
  unidade: "un",
  pc: "un",
  pacote: "pc",
  cx: "cx",
  caixa: "cx",
  fardo: "fd",
  dúzia: "dz",
  duzia: "dz",
  par: "par",
};

const CATEGORY_KEYWORDS: Array<{ patterns: RegExp[]; category: string }> = [
  {
    patterns: [/arroz|feijão|feijao|lentilha|grão|grao|macarrão|macarrao|trigo|farinha|açucar|acucar|sal|azeite|óleo|oleo|vinagre/],
    category: "Mercearia",
  },
  {
    patterns: [/leite|queijo|manteiga|iogurte|creme de leite|requeijão|requeijao|requeijão|margarina/],
    category: "Laticínios",
  },
  {
    patterns: [/carne|bovina|suína|suina|frango|peixe|picanha|alcatra|coxão|coxao|patinho|maminha|contra[-\s]?filé|contrafile/],
    category: "Carnes",
  },
  {
    patterns: [/alface|tomate|cebola|batata|cenoura|abóbora|abobora|chuchu|pimentão|pimentao|brócolis|brocolis|coentro|salsinha|cebolinha/],
    category: "Hortifrúti",
  },
  {
    patterns: [/banana|maçã|maca|laranja|limão|limao|uva|mamão|mamao|melancia|abacaxi|manga|pera|goiaba/],
    category: "Frutas",
  },
  {
    patterns: [/refrigerante|suco|água|agua|cerveja|vinho|energético|energetico/],
    category: "Bebidas",
  },
  {
    patterns: [/sabão|sabao|detergente|desinfetante|água sanitária|agua sanitária|amaciante|lustra[-\s]?móveis|lustramoveis|esponja|papel[-\s]?higiênico|papelhigienico/],
    category: "Limpeza",
  },
  {
    patterns: [/shampoo|condicionador|sabonete|pasta de dente|desodorante|fralda|absorvente|algodão/],
    category: "Higiene",
  },
  {
    patterns: [/pão|pao|biscoito|bolacha|bolo|torrada|pão de forma|pao de forma/],
    category: "Padaria",
  },
];

function detectUnit(text: string, raw: string): string {
  const cleaned = text.toLowerCase();
  for (const [key, value] of Object.entries(UNIT_MAP)) {
    const regex = new RegExp(`\\b${key}\\b`, "i");
    if (regex.test(cleaned)) return value;
  }
  const qtyMatch = raw.match(/(\d+)\s*(kg|g|l|ml|un|pc|cx|fd|dz|par)\b/i);
  if (qtyMatch?.[2]) {
    return UNIT_MAP[qtyMatch[2].toLowerCase()] ?? qtyMatch[2].toLowerCase();
  }
  return "un";
}

function categorizeProduct(name: string): string | null {
  const lower = name.toLowerCase();
  for (const { patterns, category } of CATEGORY_KEYWORDS) {
    for (const pattern of patterns) {
      if (pattern.test(lower)) return category;
    }
  }
  return null;
}

function normalizeProductName(name: string): string {
  let normalized = name
    .trim()
    .replace(/\s+/g, " ")
    .replace(/^(?:ref\s*:\s*)?\d{3,}\s*/i, "")
    .replace(/^\d{1,3}(?:[.,]\d{3})*\s*[x]\s*/i, "")
    .replace(/\s*R?\$[\d.,]+\s*/g, " ")
    .replace(/\s*(\d+)[,.](\d{2})\s*/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const unitMatch = normalized.match(/\b(\d+)\s*(kg|g|l|ml|un|pc|cx|fd|dz)\b/i);
  if (unitMatch) {
    normalized = normalized.replace(unitMatch[0]!, "").trim();
  }

  normalized = normalized
    .replace(/\s+/g, " ")
    .trim();

  if (normalized.length < 2) return name.trim();
  return normalized;
}

export class ReceiptNormalizer {
  normalize(items: ReceiptItem[], rawText: string): Array<{
    name: string;
    normalizedName: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    totalPrice: number;
    category: string | null;
    originalName: string;
  }> {
    return items.map((item) => {
      const normalizedName = normalizeProductName(item.name);
      const unit = detectUnit(item.name, rawText);
      const category = categorizeProduct(normalizedName);

      const unitPrice =
        item.quantity > 1
          ? Math.round((item.price / item.quantity) * 100) / 100
          : item.price;

      return {
        name: normalizedName,
        normalizedName,
        quantity: item.quantity,
        unit,
        unitPrice,
        totalPrice: item.price,
        category,
        originalName: item.name,
      };
    });
  }
}
