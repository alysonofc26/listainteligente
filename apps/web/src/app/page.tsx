import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShoppingCart, TrendingDown, Camera, BarChart3 } from "lucide-react";

const features = [
  {
    title: "Listas Inteligentes",
    description:
      "Crie e gerencie listas de compras com preços atualizados automaticamente.",
    icon: ShoppingCart,
  },
  {
    title: "Comparação de Preços",
    description:
      "Descubra onde cada produto está mais barato e economize em cada compra.",
    icon: TrendingDown,
  },
  {
    title: "Scanner OCR",
    description:
      "Escaneie etiquetas e cupons fiscais para adicionar produtos automaticamente.",
    icon: Camera,
  },
  {
    title: "Estatísticas",
    description:
      "Acompanhe seus gastos, economia e hábitos de consumo com gráficos detalhados.",
    icon: BarChart3,
  },
];

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-lg">
            <ShoppingCart className="h-5 w-5 text-primary" />
            Lista Inteligente
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Entrar</Button>
            </Link>
            <Link href="/cadastro">
              <Button>Cadastrar</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section className="container py-24 text-center">
          <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">
            Suas compras ficaram mais{" "}
            <span className="text-primary">inteligentes</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Crie listas, compare preços entre supermercados, escaneie produtos
            com OCR e economize em todas as suas compras.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link href="/cadastro">
              <Button size="lg" className="text-base">
                Começar Gratuitamente
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="text-base">
                Já tenho conta
              </Button>
            </Link>
          </div>
        </section>

        <section className="container py-24">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.title} className="text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mb-2 font-semibold">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      <footer className="border-t">
        <div className="container flex h-14 items-center justify-between text-sm text-muted-foreground">
          <p>&copy; 2026 Lista Inteligente. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
