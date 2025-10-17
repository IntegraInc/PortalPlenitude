"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function DestroyCookies() {
  (await cookies()).delete("userToken");
  redirect("/login");
}
