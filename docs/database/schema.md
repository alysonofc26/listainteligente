# Banco de Dados

## Estrutura

### Tabelas

| Tabela | Descrição |
|--------|-----------|
| `profiles` | Perfis dos usuários (sincronizado com auth.users via trigger) |
| `supermarkets` | Supermercados cadastrados (Carrefour, Assaí, Atacadão, Pão de Açúcar) |
| `products` | Catálogo de produtos |
| `product_prices` | Preços por produto/supermercado |
| `price_history` | Histórico de preços |
| `lists` | Listas de compras |
| `list_items` | Itens das listas |
| `receipts` | Cupons fiscais |
| `receipt_items` | Itens dos cupons |
| `favorites` | Produtos favoritos |

### Relacionamentos

```
profiles 1---* lists
profiles 1---* receipts
profiles 1---* favorites
lists 1---* list_items
products 1---* product_prices
products 1---* price_history
products 1---* favorites
supermarkets 1---* product_prices
supermarkets 1---* price_history
supermarkets 1---* receipts
receipts 1---* receipt_items
```

### RLS (Row Level Security)

- **profiles**: Apenas o próprio usuário
- **lists**: Apenas o dono da lista
- **list_items**: Herda permissão da lista
- **receipts**: Apenas o dono do recibo
- **receipt_items**: Herda permissão do recibo
- **favorites**: Apenas o dono
- **products**: Leitura pública
- **supermarkets**: Leitura pública
- **product_prices**: Leitura pública
- **price_history**: Leitura pública
