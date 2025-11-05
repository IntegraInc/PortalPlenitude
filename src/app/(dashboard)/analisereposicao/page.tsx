"use server";

import { FiltersResponse, ProductsResponse } from "@/app/types/filterTypes";
import { GetBearerToken } from "@/app/utils/getBearerToken";
import MainTable from "@/components/MainTable";

export default async function AnaliseReposicao() {
  const bearerToken = await GetBearerToken();

  // 🧩 Busca dos filtros
  const filtersRes = await fetch(
    "https://integrainc-senior-api.vercel.app/utils/filters",
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${bearerToken ?? ""}`,
      },
      cache: "no-store",
    }
  );

  if (!filtersRes.ok) {
    throw new Error(`Erro ao buscar filtros: ${filtersRes.statusText}`);
  }

  const filtersJson: FiltersResponse = await filtersRes.json();

  // 🧩 Busca dos produtos
  const productsRes = await fetch(
    "https://integrainc-senior-api.vercel.app/analisys/all?page=1&limit=100",
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${bearerToken ?? ""}`,
      },
      cache: "no-store",
    }
  );

  if (!productsRes.ok) {
    throw new Error(`Erro ao buscar produtos: ${productsRes.statusText}`);
  }

  const productsJson: ProductsResponse = await productsRes.json();

  console.log("ProductsResponse", productsJson.data);
  console.log("ProductsResponse", productsJson.data[0].monthlySales);
  // ✅ Envia filtros + produtos para tabela
  return <MainTable filters={filtersJson.data} products={productsJson.data} />;
}
