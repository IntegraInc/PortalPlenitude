"use server";

import { FiltersResponse, ProductsResponse } from "@/app/types/filterTypes";
import { GetBearerToken } from "@/app/utils/getBearerToken";
import MainTable from "@/components/MainTable";

interface PageProps {
  searchParams?: {
    page?: string;
    pageSize?: string;
    familia?: string;
  };
}

export default async function AnaliseReposicao({ searchParams }: PageProps) {
  const bearerToken = await GetBearerToken();

  // Configuração da paginação e filtros
  const currentPage = Number(searchParams?.page) || 1;
  const pageSize = Number(searchParams?.pageSize) || 50;
  const familia = searchParams?.familia || "";

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

  // 🧩 Busca dos produtos - CORREÇÃO: Não force família padrão
  let productsUrl = `https://integrainc-senior-api.vercel.app/analisys/all?page=${currentPage}&limit=${pageSize}`;

  // ✅ Apenas adicione família se existir na URL, caso contrário busca todos
  if (familia) {
    productsUrl += `&family=${familia}`;
  }
  // ❌ REMOVIDO: else { productsUrl += `&family=010`; }

  const productsRes = await fetch(productsUrl, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${bearerToken ?? ""}`,
    },
    cache: "no-store",
  });

  const productsJson: ProductsResponse & {
    pagination?: {
      currentPage: number;
      pageSize: number;
      totalItems: number;
      totalPages: number;
    };
  } = await productsRes.json();

  console.log("ProductsResponse", productsJson.data);
  console.log("Pagination", productsJson.pagination);

  return (
    <MainTable
      filters={filtersJson.data}
      products={productsJson.data || []} // ✅ Garante array vazio se não houver dados
      pagination={
        productsJson.pagination || {
          currentPage,
          pageSize,
          totalItems: 0,
          totalPages: 0,
        }
      }
      currentPage={currentPage}
    />
  );
}
