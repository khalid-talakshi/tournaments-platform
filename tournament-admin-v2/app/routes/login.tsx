import { ActionFunctionArgs, createCookie, redirect } from "@remix-run/node";
import { Form, useNavigation } from "@remix-run/react";
import { Card, PageTitle } from "~/components";
import { tokenCookie } from "~/cookies.server";
import axios from "axios";

export default function Index() {
  const navigation = useNavigation();

  return (
    <div className="flex justify-center items-center h-screen w-screen flex-col space-y-5">
      <PageTitle>Login</PageTitle>
      <Card>
        <Form method="post" action="/login">
          <div className="space-y-4 p-7 flex justify-center flex-col text-xl">
            <div className="flex justify-between space-x-2">
              <p>Username</p>
              <input
                type="text"
                name="username"
                className="bg-slate-500 text-white rounded-md px-2"
              />
            </div>
            <div className="flex justify-between space-x-2">
              <p>Password</p>
              <input
                type="password"
                name="password"
                className="bg-slate-500 text-white rounded-md px-2"
              />
            </div>
            <button
              className="bg-blue-900 text-white px-4 py-2 rounded-md hover:bg-blue-950 transition ease-in-out"
              type="submit"
              disabled={navigation.state === "submitting"}
            >
              Login
            </button>
          </div>
        </Form>
      </Card>
    </div>
  );
}

export async function action({ request }: ActionFunctionArgs) {
  const body = Object.fromEntries(await request.formData());
  const response = await axios.post(`${process.env.API_URL}/login`, body);
  if (response.data.token) {
    const cookie = { token: response.data.token };
    return redirect("/", {
      headers: { "Set-Cookie": await tokenCookie.serialize(cookie) },
    });
  }
  return redirect("/login");
}
