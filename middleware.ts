export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    "/",
    "/applications/:path*",
    "/review/:path*",
    "/companies/:path*",
    "/resumes/:path*",
    "/imports/:path*",
  ],
};
