import { createCookie } from "@remix-run/node"; // or cloudflare/deno

export const tokenCookie = createCookie("tournament-admin-token", {
  maxAge: 3 * 24 * 60 * 60, // 3 days
});
