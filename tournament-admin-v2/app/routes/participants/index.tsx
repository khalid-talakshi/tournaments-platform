import { json, type LoaderFunction, type MetaFunction } from "@remix-run/node";
import { Form, useLoaderData, useNavigate, useSubmit } from "@remix-run/react";
import axios from "axios";
import { useEffect, useReducer } from "react";
import { PageTitle } from "~/components";
import { tokenCookie } from "~/cookies.server";
import { verifyCookie } from "~/utils";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

const reducerFunction = (
  state: { verified: boolean; pending: boolean; denied: boolean },
  action: string
) => {
  switch (action) {
    case "VERIFIED":
      return { ...state, verified: !state.verified };
    case "PENDING":
      return { ...state, pending: !state.pending };
    case "DENIED":
      return { ...state, denied: !state.denied };
    default:
      return state;
  }
};

export const loader: LoaderFunction = async ({ request }) => {
  const verifyRes = await verifyCookie(request);
  if (verifyRes) return verifyRes;

  const cookieHeader = request.headers.get("Cookie");
  const cookie = await tokenCookie.parse(cookieHeader);

  const url = new URL(request.url);
  const params = url.searchParams.toString();

  console.log(params);

  const res = await axios.get(`${process.env.API_URL}/participants/all`, {
    headers: { Authorization: `Bearer ${cookie.token}` },
  });

  return json(res.data);
};

export default function Index() {
  const loaderData = useLoaderData<any[]>();
  const navigate = useNavigate();
  const [state, dispatch] = useReducer(reducerFunction, {
    verified: true,
    pending: true,
    denied: true,
  });
  const submit = useSubmit();

  useEffect(() => {
    console.log(state);
  });

  const sampleRows = [
    { id: 1, name: "John Doe", status: "Verified", date: "June 1, 2021" },
    { id: 2, name: "Jane Doe", status: "Pending", date: "June 1, 2021" },
    { id: 3, name: "John Smith", status: "Denied", date: "June 1, 2021" },
  ];

  const formatter = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: false,
  });

  const markup =
    loaderData && loaderData.length > 0 ? (
      <table className=" w-full">
        <thead className="bg-slate-800 text-left">
          <tr>
            <th className="w-1/2 py-2 px-2">Name</th>
            <th>Verification Status</th>
            <th>Last Updated</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {loaderData.map((row) => {
            return (
              <tr className="odd:bg-slate-700" key={row.id}>
                <td className="px-2 py-2">{row.name}</td>
                <td>{row.Verification.status}</td>
                <td>{formatter.format(Date.parse(row.updatedAt))}</td>
                <td>
                  <button
                    className="bg-sky-600 px-3 py-1 rounded-xl transition ease-in-out hover:bg-sky-700"
                    onClick={() => navigate(`/participant/${row.id}`)}
                  >
                    View
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    ) : (
      <div className="flex items-center justify-center h-40">
        <p>No participants found.</p>
      </div>
    );

  return (
    <div className="space-y-4">
      <PageTitle>Participants</PageTitle>
      <Form
        onChange={(e) => {
          submit(e.currentTarget);
        }}
      >
        <div className="flex justify-end space-x-2">
          <p>Verification Status</p>
          <div className="space-x-1">
            <input
              type="checkbox"
              name="verified"
              onClick={() => dispatch("VERIFIED")}
              value="true"
              checked={state.verified}
            />
            <label>Verified</label>
          </div>
          <div className="space-x-1">
            <input
              type="checkbox"
              name="pending"
              onClick={() => dispatch("PENDING")}
              value="true"
              checked={state.pending}
            />
            <label>Pending</label>
          </div>
          <div className="space-x-1">
            <input
              type="checkbox"
              name="denied"
              onClick={() => dispatch("DENIED")}
              value="true"
              checked={state.denied}
            />
            <label>Denied</label>
          </div>
        </div>
      </Form>
      <div className="mx-auto rounded-lg overflow-hidden border-slate-500 border shadow-lg shadow-slate-950">
        {markup}
      </div>
    </div>
  );
}
