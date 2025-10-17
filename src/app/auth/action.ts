"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { signIn } from "./signIn";

export default async function authenticate(formData: FormData) {
  const { responseJson } = await signIn(formData);

  // ❌ Caso de erro
  if (!responseJson.success) {
    return responseJson.error?.message || "Erro ao autenticar.";
  }

  // ✅ Caso de sucesso: cria cookie e redireciona
  const cookieConfig = {
    httpOnly: true,
    maxAge: 60 * 60 * 8, // 8 horas
    path: "/",
  };

  const cookieStore = await cookies();
  cookieStore.set("userToken", responseJson.token, cookieConfig);

  // 🔹 Retorna mensagem de sucesso (caso o front queira exibir)
  // 🔹 E faz o redirect logo em seguida
  redirect("/"); // ⚠️ Redirect precisa ser o último comando executado
}
