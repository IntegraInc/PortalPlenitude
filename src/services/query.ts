"use server";

import { revalidateTag } from "next/cache";
// import CookieHandler from "./cookieHandler";

const baseURL = process.env.NEXT_PUBLIC_API_URL;

interface Query {
  method: string;
  url: string;
  body?: Object;
  tags?: string[];
  revalidate?: string | string[];
  rawUrl?: boolean;
  cache?: "no-store";
}

export async function Query<T = any>({
  method,
  url,
  body,
  tags,
  revalidate,
  rawUrl,
  cache,
}: Query) {
  const { currentSettings, token } = await CookieHandler();

  const options: RequestInit = {
    method: method.toUpperCase(),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },

    ...(tags && { next: { tags } }),
    ...(cache && { cache }),
  };

  let completeUrl = baseURL;

  if (!currentSettings || rawUrl) {
    completeUrl;
  } else {
    const { currentBranch, company, currentCompany } = currentSettings;
    completeUrl = `${completeUrl}${company}/${currentCompany}/${currentBranch}/`;
  }

  if (
    body &&
    ["POST", "PUT", "DELETE", "PATCH"].includes(method.toUpperCase())
  ) {
    options.body = JSON.stringify(body);
  }

  const query = completeUrl + url;
  try {
    const response = await fetch(query, options);

    if (response.ok) {
      if (revalidate) {
        const tags = Array.isArray(revalidate) ? revalidate : [revalidate];
        tags.forEach((tag) => revalidateTag(tag));
      }

      return { response: (await response.json()) as T, error: null };
    } else {
      return { response: null, error: await response.json() };
    }
  } catch (error) {
    console.error(`Erro na requisição ${query} ${method}:`, error);
    throw error;
  }
}
