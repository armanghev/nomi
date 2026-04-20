import { NextResponse } from "next/server";
import { auth } from "@/auth.config";

export default auth((request) => {
  const isProtected =
    request.nextUrl.pathname.startsWith("/chat") ||
    request.nextUrl.pathname.startsWith("/settings");

  if (isProtected && !request.auth) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/chat/:path*", "/settings/:path*"],
};
