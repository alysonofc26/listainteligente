# Lista Inteligente

Assistente inteligente de compras que ajuda você antes, durante e depois das compras.

## Stack

- **Frontend:** Next.js 15, React 19, TypeScript, TailwindCSS
- **UI:** shadcn/ui, Lucide Icons
- **Backend:** Supabase (PostgreSQL, Auth, Storage)
- **OCR:** Tesseract.js
- **IA:** Groq API
- **Hospedagem:** Vercel

## Estrutura

```
/
├── apps/
│   └── web/              # Next.js application
├── packages/
│   ├── ui/               # Shared UI components
│   ├── database/         # Database client & repositories
│   ├── shared/           # Shared utilities
│   ├── types/            # TypeScript shared types
│   ├── ai/               # Groq AI integration
│   ├── ocr/              # Tesseract OCR service
│   └── scrapers/         # Supermarket scrapers
├── docs/                 # Documentation
├── supabase/             # Database schema & migrations
└── public/               # Static assets
```

## Começando

```bash
npm install
npm run dev
```
