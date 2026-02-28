import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const isAuth = !!req.nextauth.token;
    const isAdmin = req.nextauth.token?.role === "ADMIN";
    const isAdminPage = req.nextUrl.pathname.startsWith("/admin");
    const isAdminLoginPage = req.nextUrl.pathname === "/admin/login";

    if (isAdminPage && !isAdminLoginPage && !isAdmin) {
      return NextResponse.redirect(new URL(isAuth ? "/" : "/admin/login", req.url));
    }
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname;
        if (
          path === "/" ||
          path === "/login" ||
          path === "/register" ||
          path === "/admin/login" ||
          path.startsWith("/api/register")
        ) {
          return true;
        }
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: ["/admin/:path*", "/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
