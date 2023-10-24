import { createCookie } from "@remix-run/node"; // or cloudflare/deno

export const tokenCookie = createCookie("token", {
  maxAge: 3 * 24 * 60 * 60, // 3 days
});
