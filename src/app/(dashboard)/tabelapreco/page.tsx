"use server";

import {
  FiltersResponse,
  ProductsResponse,
  TablePriceResponse,
  TablePriceProductsResponse,
} from "@/app/types/filterTypes";
import { GetBearerToken } from "@/app/utils/getBearerToken";
import MainTable from "@/components/MainTable";
import MainTablePrice from "@/components/MainTablePrice";
import TablePriceMainTable from "@/components/MainTablePrice";

interface PageProps {
  searchParams?: Promise<{
    page?: string;
    pageSize?: string;
    familia?: string;
    tablePrice?: string;
    margin?: string;
    markup?: string;
  }>;
}

export default async function TabelaPreco({ searchParams }: PageProps) {
  const bearerToken = await GetBearerToken();

  // 🔧 AWAI T the searchParams Promise first
  const resolvedSearchParams = await searchParams;

  // Configuração da paginação e filtros
  // const currentPage = Number(resolvedSearchParams?.page) || 1;
  // const pageSize = Number(resolvedSearchParams?.pageSize) || 50;
  const familia = resolvedSearchParams?.familia || "";
  const tablePriceParam = resolvedSearchParams?.tablePrice || "";
  const marginParam = resolvedSearchParams?.margin || "";
  const markupParam = resolvedSearchParams?.markup || "";
  const tablePriceQuery = new URLSearchParams();

  if (familia) {
    tablePriceQuery.set("family", familia);
  }

  if (tablePriceParam) {
    tablePriceQuery.set("tablePrice", tablePriceParam);
  }

  if (marginParam) {
    tablePriceQuery.set("margin", marginParam);
  }

  if (markupParam) {
    tablePriceQuery.set("markup", markupParam);
  }

  const tablePriceUrl = `https://integrainc-senior-api.vercel.app/products/all${
    tablePriceQuery.toString() ? `?${tablePriceQuery.toString()}` : ""
  }`;

  console.log("tablePriceUrl", tablePriceUrl);
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

  // 🧩 Busca dos filtros
  const tablePrice = await fetch(
    "https://integrainc-senior-api.vercel.app/utils/filters/table-price",
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${bearerToken ?? ""}`,
      },
      cache: "no-store",
    }
  );

  const tablePriceJson: TablePriceResponse = await tablePrice.json();

  // 🔧 CORREÇÃO: Use a URL construída corretamente
  // const productsRes = await fetch(
  //   `https://integrainc-senior-api.vercel.app/analisys/all?family=${familia}`, // Use the constructed URL instead of the old one
  //   {
  //     method: "GET",
  //     headers: {
  //       "Content-Type": "application/json",
  //       Authorization: `Bearer ${bearerToken ?? ""}`,
  //     },
  //     cache: "no-store",
  //   }
  // );
  // const productsJson: ProductsResponse & {
  //   pagination?: {
  //     currentPage: number;
  //     pageSize: number;
  //     totalItems: number;
  //     totalPages: number;
  //   };
  // } = await productsRes.json();
  const tablePriceProductsRes = await fetch(tablePriceUrl, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${bearerToken ?? ""}`,
    },
    cache: "no-store",
  });

  const tablePriceProductsJson: TablePriceProductsResponse =
    await tablePriceProductsRes.json();
  console.log("tablePriceProductsJson", tablePriceProductsJson);

  return (
    <MainTablePrice
      filters={filtersJson.data}
      tablePriceFilters={tablePriceJson.data.tablePrice}
      tablePriceProducts={tablePriceProductsJson.data || []}
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
