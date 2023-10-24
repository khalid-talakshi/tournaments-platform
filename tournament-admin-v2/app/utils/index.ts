import { redirect } from "@remix-run/node";
import { tokenCookie } from "~/cookies.server";

export const verifyCookie = async (request: Request) => {
  console.log("verifyCookie");
  const cookieHeader = request.headers.get("Cookie");
  const cookie = await tokenCookie.parse(cookieHeader);
  console.log("cookie", cookie);
  console.log(!cookie || !cookie.verified);
  if (!cookie || !cookie.verified) {
    return redirect("/login");
  } else {
    return false;
  }
};
