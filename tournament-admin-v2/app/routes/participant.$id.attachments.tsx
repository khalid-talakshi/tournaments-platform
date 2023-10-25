import {
  isRouteErrorResponse,
  useLoaderData,
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

  console.log(
    `${process.env.API_URL}/admin/participant/${params.id}/attachments`
  );

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

  return (
    <div className="space-y-1">
      <p className="text-2xl font-bold">Attachments</p>
      <div>
        <ScrollArea.Root className="w-1/4 h-52">
          <ScrollArea.Viewport className="h-full w-full">
            {tags.map((v, i) => (
              <div
                key={i}
                className="bg-slate-800 my-2 rounded text-lg p-2 hover:bg-slate-700"
              >
                {v.name}
              </div>
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
