import { redirect } from "@remix-run/node";
import { tokenCookie } from "~/cookies.server";

export const verifyCookie = async (request: Request) => {
  const cookieHeader = request.headers.get("Cookie");
  const cookie = await tokenCookie.parse(cookieHeader);
  if (!cookie || !cookie.verified) {
    return redirect("/login");
  } else {
    return false;
  }
};
