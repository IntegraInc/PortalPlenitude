import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  if (!request.cookies.has("userToken")) {
    return NextResponse.rewrite(new URL("/login", request.url));
  }

  //   const { response } = await Query({
  //     method: "get",
  //     url: "validateToken",
  //   });

  //   if (response) {
  //     return NextResponse.next();
  //   }

  return NextResponse.rewrite(new URL("/login", request.url));
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * /login
     */
    "/((?!api|_next/static|_next/image|favicon.ico|/login).*)",
  ],
};
