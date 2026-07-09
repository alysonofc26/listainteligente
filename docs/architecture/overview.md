# Arquitetura

## Visão Geral

O Lista Inteligente segue uma arquitetura modular com monorepo, separando responsabilidades em pacotes independentes.

## Diagrama de Camadas

```
apps/web (Next.js 15)
    |
    |--- packages/ui (Componentes compartilhados)
    |--- packages/database (Repositórios, migrations)
    |--- packages/shared (Utilitários)
    |--- packages/types (Tipos TypeScript)
    |--- packages/ai (Integração Groq)
    |--- packages/ocr (Tesseract.js)
    |--- packages/scrapers (Scrapers de supermercados)
```

## Decisões Técnicas

### Monorepo
- npm workspaces para gerenciamento de pacotes
- Código compartilhado entre pacotes
- Build e typecheck centralizados

### Supabase
- Autenticação gerenciada pelo Supabase Auth
- PostgreSQL com RLS (Row Level Security)
- Storage para imagens de produtos e cupons

### Scrapers
- Arquitetura desacoplada (Strategy Pattern)
- Cada supermercado tem sua implementação
- Interface comum para todos os scrapers

### IA
- Módulo isolado sem acoplamento com regras de negócio
- Groq API via HTTP (plano gratuito)
- Serviço separado para orquestração

### OCR
- Tesseract.js (client-side)
- Parser dedicado para extração de preços
- Serviço separado com worker lifecycle
