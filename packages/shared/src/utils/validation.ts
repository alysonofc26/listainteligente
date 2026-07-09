export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidPrice(value: unknown): value is number {
  return typeof value === "number" && value >= 0 && isFinite(value);
}

export function isValidQuantity(value: unknown): value is number {
  return typeof value === "number" && value > 0 && isFinite(value);
}

export function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}
