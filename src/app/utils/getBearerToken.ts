"use server";
import { cookies } from "next/headers";

export async function GetBearerToken() {
  const bearerToken = (await cookies()).get("userToken")?.value;

  return bearerToken;
}
