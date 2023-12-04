import { ActionFunction, LoaderFunction, redirect } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import axios from "axios";
import { AiOutlineArrowLeft } from "react-icons/ai/index.js";
import { Card, PageTitle } from "~/components";
import { tokenCookie } from "~/cookies.server";

export const loader: LoaderFunction = async ({ request, params }) => {
  const sessionCookie = request.headers.get("Cookie");
  const cookie = await tokenCookie.parse(sessionCookie ?? "");
  if (!cookie) {
    return redirect("/", {
      headers: { "Set-Cookie": await tokenCookie.serialize({}) },
    });
  }

  const res = await axios.get(
    `${process.env.API_URL}/categories/${params.id}?includeTeams=true`,
    {
      headers: { Authorization: `Bearer ${cookie.token}` },
    }
  );

  return res.data;
};

export default function Index() {
  const loaderData = useLoaderData<any>();

  console.log(loaderData);

  return (
    <div className="space-y-4">
      <div className="space-y-2 pt-4">
        <Link
          to="/participants"
          className="underline flex space-y-4 items-center text-lg hover:text-slate-300 transition ease-in-out"
        >
          <AiOutlineArrowLeft />
          Back
        </Link>
      </div>
      <PageTitle>{loaderData.name}</PageTitle>
      <Card>
        <p>
          <span className="font-bold">Code:</span> {loaderData.code}
        </p>
        <p>
          <span className="font-bold">Number of Teams:</span>{" "}
          {loaderData.Teams.length}
        </p>
        <p>
          <span className="font-bold">Minimum Age:</span>{" "}
          {loaderData.minAge ? loaderData.minAge : "None"}
        </p>
        <p>
          <span className="font-bold">Maximum Age:</span>{" "}
          {loaderData.maxAge ? loaderData.maxAge : "None"}
        </p>
      </Card>
    </div>
  );
}

export const action: ActionFunction = async ({ request, params }) => {
  const sessionCookie = request.headers.get("Cookie");
  const cookie = await tokenCookie.parse(sessionCookie ?? "");
  if (!cookie) {
    return redirect("/", {
      headers: { "Set-Cookie": await tokenCookie.serialize({}) },
    });
  }

  if (request.method === "DELETE") {
    await axios.delete(`${process.env.API_URL}/categories/${params.id}`, {
      headers: { Authorization: `Bearer ${cookie.token}` },
    });

    return redirect("/categories");
  }

  return redirect("/categories", { status: 400 });
};
