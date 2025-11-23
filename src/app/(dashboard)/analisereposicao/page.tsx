"use server";

import { FiltersResponse, ProductsResponse } from "@/app/types/filterTypes";
import { GetBearerToken } from "@/app/utils/getBearerToken";
import MainTable from "@/components/MainTable";

interface PageProps {
  searchParams?: Promise<{
    page?: string;
    pageSize?: string;
    familia?: string;
  }>;
}

export default async function AnaliseReposicao({ searchParams }: PageProps) {
  const bearerToken = await GetBearerToken();

  // 🔧 AWAI T the searchParams Promise first
  const resolvedSearchParams = await searchParams;

  // Configuração da paginação e filtros
  // const currentPage = Number(resolvedSearchParams?.page) || 1;
  // const pageSize = Number(resolvedSearchParams?.pageSize) || 50;
  const familia = resolvedSearchParams?.familia || "";

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

  const filtersJson: FiltersResponse = await filtersRes.json();

  // // 🧩 Busca dos produtos - CORREÇÃO: Não force família padrão
  // let productsUrl = `https://integrainc-senior-api.vercel.app/analisys/all?family=904`;

  // // ✅ Apenas adicione família se existir na URL, caso contrário busca todos
  // if (familia) {
  //   productsUrl += `&family=${familia}`;
  // }

  // 🔧 CORREÇÃO: Use a URL construída corretamente
  const productsRes = await fetch(
    `https://integrainc-senior-api.vercel.app/analisys/all?family=${familia}`, // Use the constructed URL instead of the old one
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${bearerToken ?? ""}`,
      },
      cache: "no-store",
    }
  );

  const productsJson: ProductsResponse & {
    pagination?: {
      currentPage: number;
      pageSize: number;
      totalItems: number;
      totalPages: number;
    };
  } = await productsRes.json();

  console.log("productsRes", productsJson.data);
  return (
    <MainTable
      filters={filtersJson.data}
      products={productsJson.data || []} // ✅ Garante array vazio se não houver dados
      // pagination={
      //   productsJson.pagination || {
      //     currentPage,
      //     pageSize,
      //     totalItems: 0,
      //     totalPages: 0,
      //   }
      // }
      // currentPage={currentPage}
    />
  );
}
