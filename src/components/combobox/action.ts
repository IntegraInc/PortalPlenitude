"use server";

import { cookies } from "next/headers";

export async function getAllSuppliers() {
  const bearerToken = (await cookies()).get("userToken")?.value;
  const response = await fetch(
    "https://integrainc-senior-api.vercel.app/utils/filters",
    {
      method: "get",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${bearerToken && bearerToken.toString()}`,
      },
    }
  );

  const responseJson = await response.json();
  // const { response, error } = await Query({
  //   method: "post",
  //   url: "login",
  //   rawUrl: true,
  //   body,
  // });

  return { responseJson };
}
