import NextAuth from "next-auth";
import { authConfig } from "./auth.config";



const { auth: middlewareAuth } = NextAuth(authConfig);

export default middlewareAuth((req) => {
    const isLoggedIn = !!req.auth;
    const url = req.nextUrl.pathname;
    const method = req.method;
    const actionHeader = req.headers.get("next-action") || req.headers.get("x-nextjs-post-segment-action");

    console.log(`[REQ] ${method} ${url} (Auth: ${isLoggedIn}) ${actionHeader ? `[ACTION: ${actionHeader}]` : ""}`);

    const isOnDashboard = url.startsWith("/");
    const isAuthPage = url.startsWith("/login") || url.startsWith("/register");

    if (isOnDashboard && !isLoggedIn && !isAuthPage) {
        console.warn(`[MIDDLEWARE] Redirecting ${method} ${url} to /login (Not Logged In)`);
        return Response.redirect(new URL("/login", req.nextUrl));
    }

    if (isAuthPage && isLoggedIn) {
        console.log(`[MIDDLEWARE] Redirecting ${method} ${url} to / (Already Logged In)`);
        return Response.redirect(new URL("/", req.nextUrl));
    }
});

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico|favicon.svg|logo.svg).*)"],
};


