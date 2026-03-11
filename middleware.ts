export { default } from "next-auth/middleware";

export const config = {
  matcher: ["/operators/dashboard/:path*", "/operators/applications/:path*"]
};
