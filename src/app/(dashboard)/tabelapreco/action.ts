/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { GetBearerToken } from "@/app/utils/getBearerToken";

export async function changePrice(body: any) {
 const bearerToken = await GetBearerToken();
 const response = await fetch(
  `${process.env.NEXT_PUBLIC_API_URL}products/change-price`,
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
export async function importPrice(body: any) {
 const bearerToken = await GetBearerToken();
 const response = await fetch(
  `${process.env.NEXT_PUBLIC_API_URL}products/import-price`,
  //   "http://localhost:3000/products/import-price",
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
