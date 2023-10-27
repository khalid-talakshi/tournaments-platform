import {
  Link,
  Outlet,
  isRouteErrorResponse,
  useLoaderData,
  useLocation,
  useRouteError,
} from "@remix-run/react";
import * as ScrollArea from "@radix-ui/react-scroll-area";
import { LoaderFunction, json } from "@remix-run/node";
import axios from "axios";
import { verifyCookie } from "~/utils";
import { tokenCookie } from "~/cookies.server";

export const loader: LoaderFunction = async ({ request, params }) => {
  const verifyRes = await verifyCookie(request);
  if (verifyRes) return verifyRes;

  const cookie = await tokenCookie.parse(request.headers.get("Cookie"));

  const { data } = await axios.get(
    `${process.env.API_URL}/admin/participant/${params.id}/attachments`,
    {
      headers: { Authorization: `Bearer ${cookie.token}` },
    }
  );
  return json(data);
};

export default function Index() {
  const tags = useLoaderData<any[]>();
  const location = useLocation();

  tags.forEach((v) => {
    v.to = `/${location.pathname.split("/").slice(1, 4).join("/")}/${v.name
      .toLowerCase()
      .replace(" ", "-")}`;
  });

  return (
    <div className="space-y-1">
      <p className="text-2xl font-bold">Attachments</p>
      <div className="flex">
        <ScrollArea.Root className="w-1/4 h-52">
          <ScrollArea.Viewport className="h-full w-full">
            {tags.map((v, i) => (
              <Link to={v.key} key={i}>
                <div
                  className={`my-2 rounded text-lg p-2 hover:bg-slate-800 ${
                    location.pathname === v.to
                      ? "bg-slate-800"
                      : "bg-slate-700 "
                  }`}
                >
                  {v.name}
                </div>
              </Link>
            ))}
          </ScrollArea.Viewport>
          <ScrollArea.Scrollbar
            className="flex select-none touch-none p-0.5 bg-blackA3 transition-colors duration-[160ms] ease-out hover:bg-blackA5 data-[orientation=vertical]:w-2.5 data-[orientation=horizontal]:flex-col data-[orientation=horizontal]:h-2.5"
            orientation="vertical"
          >
            <ScrollArea.Thumb className="flex-1 bg-mauve10 rounded-[10px] relative before:content-[''] before:absolute before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:w-full before:h-full before:min-w-[44px] before:min-h-[44px]" />
          </ScrollArea.Scrollbar>
          <ScrollArea.Corner className="bg-black-50" />
        </ScrollArea.Root>
        <div className="w-3/4">
          <Outlet context={{ tags }} />
        </div>
      </div>
    </div>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    return (
      <div className="w-fit">
        <h1>
          {error.status} {error.statusText}
        </h1>
        <p>{error.data}</p>
      </div>
    );
  } else if (error instanceof Error) {
    return (
      <div className="w-full">
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
