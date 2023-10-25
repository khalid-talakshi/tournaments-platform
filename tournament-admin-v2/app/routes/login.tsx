import {
  ActionFunctionArgs,
  LoaderFunction,
  createCookie,
  json,
  redirect,
} from "@remix-run/node";
import { Form, useActionData, useNavigation } from "@remix-run/react";
import { Card, PageTitle } from "~/components";
import { tokenCookie } from "~/cookies.server";
import axios, { AxiosError } from "axios";

export const loader: LoaderFunction = async ({ request }) => {
  const cookieHeader = request.headers.get("Cookie");
  const cookie = await tokenCookie.parse(cookieHeader);
  if (cookie && cookie.token) {
    return redirect("/");
  }
  return {};
};

export default function Index() {
  const navigation = useNavigation();
  const actionData = useActionData<{ message: string }>();

  console.log(actionData);

  return (
    <div className="flex justify-center items-center h-screen w-screen flex-col space-y-5">
      {actionData && (
        <div className="bg-red-500 outline outline-red-600 outline-offset-2 px-7 py-5 rounded-lg">
          <p>An error occured: {actionData.message}</p>
        </div>
      )}
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
  try {
    const body = Object.fromEntries(await request.formData());
    const response = await axios.post(`${process.env.API_URL}/login`, body);
    if (response.data.token) {
      const cookie = { token: response.data.token };
      return redirect("/", {
        headers: { "Set-Cookie": await tokenCookie.serialize(cookie) },
      });
    }
    return redirect("/login");
  } catch (error: any) {
    if (error.response) {
      return json({ message: error.response.data.message }, { status: 400 });
    }
    return json(
      { message: "We don't know what though. We will investigate" },
      { status: 500 }
    );
  }
}
