import { LoaderFunction, json } from "@remix-run/node";
import axios from "axios";
import {
  Link,
  Outlet,
  isRouteErrorResponse,
  useLoaderData,
  useLocation,
  useNavigate,
  useRouteError,
} from "@remix-run/react";
import { Card } from "~/components";
import { tokenCookie } from "~/cookies.server";
import { UTCFormatter, localeFormatter, verifyCookie } from "~/utils";
import { AiOutlineArrowLeft } from "react-icons/ai/index.js";

export const loader: LoaderFunction = async ({ request, params }) => {
  const verifyRes = await verifyCookie(request);
  if (verifyRes) return verifyRes;

  const cookie = await tokenCookie.parse(request.headers.get("Cookie"));

  const participantData = await axios.get(
    `${process.env.API_URL}/admin/participant/${params.id}`,
    {
      headers: { Authorization: `Bearer ${cookie.token}` },
    }
  );

  const headshot = await axios.get(
    `${process.env.API_URL}/image/${participantData.data.headshotKey}`,
    {
      headers: { Authorization: `Bearer ${cookie.token}` },
    }
  );

  return json({ data: participantData.data, headshot: headshot.data });
};

export default function Participant() {
  const { data, headshot } = useLoaderData<any>();
  const location = useLocation();

  const mainPath = `/${location.pathname.split("/").slice(1, 3).join("/")}`;
  const tabPath = `/${location.pathname.split("/").slice(1, 4).join("/")}`;

  const tabs = [
    { name: "Verification", to: `${mainPath}/verify` },
    { name: "Reports", to: `${mainPath}/reports` },
    { name: "Attachments", to: `${mainPath}/attachments` },
    { name: "Teams", to: `${mainPath}/teams` },
  ];

  return (
    <div className="space-y-2 pt-4">
      <Link
        to="/participants"
        className="underline flex space-y-4 items-center text-lg hover:text-slate-300 transition ease-in-out"
      >
        <AiOutlineArrowLeft />
        Back
      </Link>
      <Card>
        <div className="flex w-fill">
          <div className="w-1/2 space-y-2">
            <p className="text-3xl font-bold">{data.name}</p>
            <p className="text-xl">
              <span className="font-bold">Date of Birth:</span>{" "}
              {UTCFormatter.format(Date.parse(data.dob))}
            </p>
            <p className="text-xl">
              <span className="font-bold">Email:</span> {data.email}
            </p>
            <p className="text-xl">
              <span className="font-bold">Phone Number:</span>{" "}
              {data.phoneNumber}
            </p>
            <p className="text-xl">
              <span className="font-bold">Gender:</span> {data.gender}
            </p>
            {data.parentEmail && (
              <p className="text-xl">
                <span className="font-bold">Parent Email:</span>{" "}
                {data.parentEmail}
              </p>
            )}
            <hr />
            <p className="text-2xl font-bold">Record Details</p>
            <p className="text-xl">
              <span className="font-bold">Record ID:</span> {data.id}
            </p>
            <p className="text-xl">
              <span className="font-bold">Record Created:</span>{" "}
              {localeFormatter.format(Date.parse(data.createdAt))}
            </p>
            <p className="text-xl">
              <span className="font-bold">Record Updated:</span>{" "}
              {localeFormatter.format(Date.parse(data.updatedAt))}
            </p>
          </div>
          <div className="flex justify-center w-1/2 items-center">
            <div className="rounded overflow-hidden h-full">
              <img
                src={`${headshot}`}
                alt="headshot"
                className="w-auto h-full"
              />
            </div>
          </div>
        </div>
      </Card>
      <Card>
        <div className="flex flex-row space-x-2 justify-between mb-2">
          {tabs.map((tab) => {
            return (
              <Link to={tab.to} className="w-full">
                <div
                  className={`w-full text-center border transition ease-in-out border-slate-100 rounded text-lg hover:bg-slate-500 ${
                    tab.to === tabPath && "bg-slate-800 border-slate-300"
                  }`}
                >
                  {tab.name}
                </div>
              </Link>
            );
          })}
        </div>
        <Outlet context={{ verification: data.Verification }} />
      </Card>
    </div>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    return (
      <div>
        <h1>
          {error.status} {error.statusText}
        </h1>
        <p>{error.data}</p>
      </div>
    );
  } else if (error instanceof Error) {
    return (
      <div>
        <h1>Error</h1>
        <p>{error.message}</p>
        <p>The stack trace is:</p>
        <pre>{error.stack}</pre>
      </div>
    );
  } else {
    return <h1>Unknown Error</h1>;
  }
}
