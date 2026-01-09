"use server";

import ClientAnalysis from "@/components/ClientAnalisys";
import { GetBearerToken } from "@/app/utils/getBearerToken";
import type { FiltersResponse } from "@/app/types/filterTypes";

interface PageProps {
  searchParams?: Promise<{ familia?: string; page?: string; pageSize?: string }>;
}

export default async function AnaliseReposicao({ searchParams }: PageProps) {
  const bearerToken = await GetBearerToken();
  const sp = await searchParams;
  const familia = sp?.familia ?? "";
  const page = Number(sp?.page ?? 1);
  const pageSize = Number(sp?.pageSize ?? 50);

  const api = process.env.NEXT_PUBLIC_API_URL!;

  // 🔧 Busca apenas os filtros
  const filtersRes = await fetch(`${api}utils/filters`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${bearerToken ?? ""}`,
    },
    cache: "no-store",
  });
  const filtersJson: FiltersResponse = await filtersRes.json();

  // ✅ Não busca produtos aqui. A tela inicia vazia e o fetch rola só no “Filtrar”.
  return (
    <ClientAnalysis
      bearerToken={bearerToken ?? ""}
      initialProducts={[]}               // começa vazio
      filters={filtersJson.data}         // FiltersData completo
      initialQuery={{ familia, page, pageSize }}
    />
  );
}
