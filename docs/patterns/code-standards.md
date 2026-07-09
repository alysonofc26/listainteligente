# Padrões de Código

## Nomenclatura

- **Pastas:** kebab-case (ex: `minha-lista`, `ui-components`)
- **Arquivos:** kebab-case (ex: `button.tsx`, `auth-provider.tsx`)
- **Componentes:** PascalCase (ex: `Button`, `DashboardShell`)
- **Funções:** camelCase (ex: `formatCurrency`, `handleSubmit`)
- **Hooks:** camelCase prefixado com `use` (ex: `useAuth`, `useTheme`)
- **Tipos/Interfaces:** PascalCase prefixado (ex: `UserProfile`, `ShoppingList`)
- **Constantes:** UPPER_SNAKE_CASE (ex: `DEFAULT_CURRENCY`)

## Organização de Arquivos

```
src/
  app/           # Páginas (Next.js App Router)
  components/    # Componentes React
    ui/          # shadcn/ui components
    layout/      # Layout components
    shared/      # Shared components
  lib/           # Bibliotecas e configurações
    supabase/    # Supabase clients
  hooks/         # Custom hooks
  services/      # Services
  styles/        # Global styles
```

## Princípios

1. **Clean Code**: Código legível e auto-documentado
2. **SOLID**: Single responsibility, Open/closed, etc
3. **DRY**: Não repita código
4. **TypeScript First**: Tipagem forte, sem `any`
5. **Componentes pequenos**: Um componente, uma responsabilidade
6. **Hooks reutilizáveis**: Lógica extraída para hooks

## Commits

Seguir Conventional Commits:

- `feat:` Nova funcionalidade
- `fix:` Correção de bug
- `docs:` Documentação
- `refactor:` Refatoração
- `style:` Estilo de código
- `chore:` Manutenção
