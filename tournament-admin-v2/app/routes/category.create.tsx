import { ActionFunction, redirect } from "@remix-run/node";
import axios from "axios";
import { tokenCookie } from "~/cookies.server";

export const action: ActionFunction = async ({ request }) => {
  const body = await request.formData();
  const data = Object.fromEntries(body);

  const { token } = await tokenCookie.parse(request.headers.get("Cookie"));

  if (data.name === "" || data.code === "")
    return redirect("/categories", { status: 400 });

  const payload = {
    name: data.name,
    code: data.code,
    minAge: data.minAge !== "" ? Number(data.minAge) : null,
    maxAge: data.maxAge !== "" ? Number(data.maxAge) : null,
    female: data.female ? true : false,
  };

  console.log(payload);

  await axios.post(`${process.env.API_URL}/categories`, payload, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return redirect("/categories?success=true");
};
