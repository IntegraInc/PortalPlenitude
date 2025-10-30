"use server";

import { GetBearerToken } from "@/app/utils/getBearerToken";
import { OrderData } from "@/components/MainTable";

export default async function createBuyingOrder(body: OrderData) {
  const bearerToken = await GetBearerToken();
  const response = await fetch(
    "https://integrainc-senior-api.vercel.app/analisys/buying-order",
    {
      method: "post",
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${bearerToken ?? ""}`,
      },
    }
  );

  const responseJson = await response.json();

  return { responseJson };
}
