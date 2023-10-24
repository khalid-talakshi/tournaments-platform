import { ActionFunction, redirect } from "@remix-run/node";
import { tokenCookie } from "~/cookies.server";

export const action: ActionFunction = async ({ request }) => {
  const sessionCookie = request.headers.get("Cookie");
  const cookie = await tokenCookie.parse(sessionCookie ?? "");
  if (cookie) {
    return redirect("/", {
      headers: { "Set-Cookie": await tokenCookie.serialize({}) },
    });
  }
};
