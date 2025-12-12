/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { GetBearerToken } from "@/app/utils/getBearerToken";

export default async function createBuyingOrder(body: any) {
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

export async function changePrice(body: any) {
  const bearerToken = await GetBearerToken();
  const response = await fetch(
    "https://integrainc-senior-api.vercel.app/products/change-price",
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
