"use server";

import {
  FiltersResponse,
  TablePriceResponse,
  TablePriceProductsResponse,
} from "@/app/types/filterTypes";
import { GetBearerToken } from "@/app/utils/getBearerToken";
import ClientTablePrice from "./ClientTablePrice";

interface PageProps {
  searchParams?: Promise<Record<string, string | undefined>>;
}

export default async function TabelaPreco({ searchParams }: PageProps) {
  const bearerToken = await GetBearerToken();
  const sp = (await searchParams) ?? {}; // << AQUI O AWAIT

  const familia = sp.familia ?? "";
  const tablePriceParam = sp.tablePrice ?? "";
  const marginParam = sp.margin ?? "";
  const markupParam = sp.markup ?? "";
  const page = Number(sp.page ?? "1");
  const pageSize = Number(sp.pageSize ?? "50");


  // filtros (famílias + tabelas)
  const [filtersRes, tablePriceRes] = await Promise.all([
    fetch(`${process.env.NEXT_PUBLIC_API_URL}utils/filters`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${bearerToken ?? ""}`,
      },
      cache: "no-store",
    }),
    fetch(`${process.env.NEXT_PUBLIC_API_URL}utils/filters/table-price`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${bearerToken ?? ""}`,
      },
      cache: "no-store",
    }),
  ]);

  const filtersJson: FiltersResponse = await filtersRes.json();
  const tablePriceJson: TablePriceResponse = await tablePriceRes.json();


  // carga inicial dos produtos (respeita os searchParams quando entrar na página)
  const qs = new URLSearchParams();
  if (familia) qs.set("family", familia);
  if (tablePriceParam) qs.set("tablePrice", tablePriceParam);
  if (marginParam) qs.set("margin", marginParam);
  if (markupParam) qs.set("markup", markupParam);
  qs.set("limit", "1000");

  const resp = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}products/all?${qs.toString()}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${bearerToken ?? ""}`,
      },
      cache: "no-store",
    }
  );
  const tablePriceProductsJson: TablePriceProductsResponse = await resp.json();

  const tablePriceOptions = (tablePriceJson.data?.tablePrice ?? []).map(
    (t: string | { code: string }) =>
      typeof t === "string" ? { code: t } : t
  );

  return (


    <ClientTablePrice
      bearerToken={bearerToken ?? null}
      initialProducts={tablePriceProductsJson.data || []}
      families={filtersJson.data?.family ?? []}
      tablePriceOptions={tablePriceOptions}
      initialQuery={{
        familia,
        tablePrice: tablePriceParam,
        margin: marginParam,
        markup: markupParam,
        page,
        pageSize,
      }}
    />
  );
}
