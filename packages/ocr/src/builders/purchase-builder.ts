import { ReceiptParser } from "../parsers/receipt-parser";
import { ReceiptNormalizer } from "../normalizers/receipt-normalizer";
import { ReceiptValidator } from "../validators/receipt-validator";
import type {
  PurchaseResult,
  PurchaseItem,
  PurchaseMetadata,
} from "../types/purchase-result";

export class PurchaseBuilder {
  private readonly parser: ReceiptParser;
  private readonly normalizer: ReceiptNormalizer;
  private readonly validator: ReceiptValidator;

  constructor() {
    this.parser = new ReceiptParser();
    this.normalizer = new ReceiptNormalizer();
    this.validator = new ReceiptValidator();
  }

  build(rawText: string, confidence: number): PurchaseResult {
    const parsed = this.parser.parse(rawText, confidence);

    const normalizedItems = this.normalizer.normalize(
      parsed.items,
      rawText,
    );

    const totalFromItems =
      Math.round(
        normalizedItems.reduce((sum, item) => sum + item.totalPrice, 0) * 100,
      ) / 100;

    const totalAmount = parsed.total ?? totalFromItems;

    const items: PurchaseItem[] = normalizedItems.map((item) => ({
      name: item.normalizedName,
      quantity: item.quantity,
      unit: item.unit,
      unitPrice: item.unitPrice,
      totalPrice: item.totalPrice,
      category: item.category,
      normalizedName: item.normalizedName,
      originalName: item.originalName,
    }));

    const metadata: PurchaseMetadata = {
      supermarketName: parsed.supermarketName,
      date: parsed.date,
      totalAmount,
      subtotal: totalFromItems,
      taxAmount: null,
      paymentMethod: null,
      itemCount: items.length,
      confidence: parsed.confidence,
      rawText,
    };

    const validations = this.validator.validate({
      supermarketName: parsed.supermarketName,
      date: parsed.date,
      total: parsed.total,
      items: parsed.items,
      rawText,
    });

    return {
      metadata,
      items,
      validations,
      normalized: true,
    };
  }
}
