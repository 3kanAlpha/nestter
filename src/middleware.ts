export { auth as middleware } from "@/auth";

export const config = {
  matcher: ['/signup', '/search', '/user/:name/edit'],
}