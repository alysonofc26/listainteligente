# Sprint 3 - OCR Platform + Scanner

## Status: ✅ Concluído

## Objetivos

- [x] Arquitetura de plataforma OCR (engine/parsers/processors/types)
- [x] TesseractEngine - worker Tesseract.js com whitelist e language config
- [x] LabelParser - extração de nome, preço, quantidade de etiquetas
- [x] ReceiptParser - extração de items, total, data, supermercado de cupons
- [x] ImageProcessor - pré-processamento (grayscale, threshold, redimensionamento)
- [x] Hook useCamera - acesso à câmera, captura, troca de câmera
- [x] Hook useOCR - ciclo de vida do OCR (init → process → parse → result)
- [x] Componente CameraPreview - viewfinder com sobreposição
- [x] Componente ScanResult - exibição de dados extraídos
- [x] Página /scanner - fluxo completo com seletor de lista
- [x] Integração com Minha Lista (adicionar produto escaneado)

## Novos Arquivos

```
packages/ocr/
  src/
    engine/
      tesseract.ts          # TesseractEngine wrapper
    parsers/
      base.ts               # BaseParser abstrato
      label-parser.ts       # LabelParser (etiquetas)
      receipt-parser.ts     # ReceiptParser (cupons fiscais)
    processors/
      image-processor.ts    # Pré-processamento de imagem
    types/
      index.ts              # Tipos do OCR
    index.ts                # API pública

apps/web/src/
  hooks/
    use-camera.ts           # Hook de câmera
    use-ocr.ts              # Hook de OCR
  components/
    scanner/
      camera-preview.tsx    # Preview da câmera
      scan-result.tsx       # Resultado do OCR
    ui/
      select.tsx            # Componente Select (novo)
```

## Arquitetura OCR (Plataforma)

```
OCR (Tesseract.js)
    ↓
Texto bruto
    ↓
Parsers (seletor por contexto)
    ├── LabelParser  →  { productName, price, quantity }
    └── ReceiptParser →  { supermarket, date, total, items[] }
    ↓
Resultado estruturado
    ↓
Adicionado à lista / Histórico
```

### Engine
- `TesseractEngine` — wrapper singleton do Tesseract.js
- Carregamento lazy (só importa quando usado)
- Whitelist de caracteres para melhorar precisão em preços
- Status tracking (idle → initializing → ready → terminated)

### Parsers
- `BaseParser` — classe abstrata com métodos utilitários (extractPrice, extractQuantity, cleanText)
- `LabelParser` — foco em etiquetas de preço (nome + preço + unidade)
- `ReceiptParser` — foco em cupons fiscais (múltiplos itens + total + data)

### Processors
- `ImageProcessor` — pré-processamento client-side (canvas)
- Redimensionamento para max 2048px
- Grayscale + threshold (binarização) para melhorar OCR

## Decisões Técnicas

1. **Plataforma, não feature**: OCR separado em engine/parsers/processors, reutilizável na Sprint 8
2. **Parser pattern**: `LabelParser` e `ReceiptParser` implementam `Parser<T>`, fácil adicionar novos
3. **Hooks desacoplados**: `useCamera` e `useOCR` são hooks independentes, testáveis e reutilizáveis
4. **Carregamento lazy do Tesseract.js**: Só baixa o worker WASM quando o usuário realmente escaneia
5. **Pré-processamento**: Melhora significativamente a acurácia do OCR em condições reais
6. **Seletor de lista no scanner**: UX direta — escaneia e já adiciona à lista escolhida

## Próximos Passos

Sprint 4 — Scrapers: implementar Carrefour (primeiro supermercado funcional)
