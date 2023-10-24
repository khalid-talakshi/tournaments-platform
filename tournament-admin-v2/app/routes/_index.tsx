import { LoaderFunction, LoaderFunctionArgs, redirect } from "@remix-run/node";
import { tokenCookie } from "~/cookies.server";
import axios from "axios";

export const loader: LoaderFunction = async ({
  request,
}: LoaderFunctionArgs) => {
  const cookieHeader = request.headers.get("Cookie");
  const cookie = await tokenCookie.parse(cookieHeader);
  if (!cookie || !cookie.token) return redirect("/login");
  const verify = await axios.post(`${process.env.API_URL}/admin/verify`, {
    token: cookie.token,
  });
  if (!verify.data.verified) return redirect("/login");
  cookie.verified = true;
  return redirect("/dashboard", {
    headers: { "Set-Cookie": await tokenCookie.serialize(cookie) },
  });
};
