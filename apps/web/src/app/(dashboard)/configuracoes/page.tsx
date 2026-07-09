"use client";

import { useTheme } from "@/components/layout/theme-provider";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sun, Moon, Monitor } from "lucide-react";

export default function ConfiguracoesPage() {
  const { theme, setTheme } = useTheme();

  const themeOptions = [
    {
      value: "light" as const,
      label: "Claro",
      icon: Sun,
      description: "Tema claro padrão",
    },
    {
      value: "dark" as const,
      label: "Escuro",
      icon: Moon,
      description: "Tema escuro para ambientes com pouca luz",
    },
    {
      value: "system" as const,
      label: "Sistema",
      icon: Monitor,
      description: "Segue a preferência do seu dispositivo",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground">
          Personalize sua experiência no Lista Inteligente.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Aparência</CardTitle>
          <CardDescription>
            Escolha o tema que prefere para a interface.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            {themeOptions.map((option) => {
              const Icon = option.icon;
              const isActive = theme === option.value;
              return (
                <Button
                  key={option.value}
                  variant={isActive ? "default" : "outline"}
                  className="flex h-auto flex-col items-center gap-2 p-6"
                  onClick={() => setTheme(option.value)}
                >
                  <Icon className="h-6 w-6" />
                  <div className="text-center">
                    <p className="text-sm font-medium">{option.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {option.description}
                    </p>
                  </div>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
