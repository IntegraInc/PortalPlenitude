import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // Se o usuário não tiver o token, redireciona para /login
  if (!request.cookies.has("userToken")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Caso o token exista, apenas segue normalmente
  return NextResponse.next();
}

// Configuração para aplicar o middleware nas rotas corretas
export const config = {
  matcher: [
    // aplica o middleware em todas as rotas exceto /login, /api, /_next, favicon etc
    "/((?!api|_next/static|_next/image|favicon.ico|login).*)",
  ],
};
