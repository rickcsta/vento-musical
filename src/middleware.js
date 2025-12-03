import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req) {
  const { pathname } = req.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET
  });

  console.log("Middleware rodando");
  console.log("Token:", token);
  console.log("Pathname:", pathname);

  const rotaProtegida =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/admin/sobre-nos") ||
    pathname.startsWith("/admin/fotos") ||
    pathname.startsWith("/admin/eventos");

    console.log("estou aqui 1");

  if (rotaProtegida && !token) {
    const url = new URL("/login", req.url);
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  console.log("estou aqui 2");

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
