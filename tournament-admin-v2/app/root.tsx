import { cssBundleHref } from "@remix-run/css-bundle";
import { type LinksFunction } from "@remix-run/node";
import {
  Form,
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLocation,
} from "@remix-run/react";

import stylesheet from "~/tailwind.css";
import { NavSidebar } from "./components";
import { AiOutlineLogout } from "react-icons/ai/index.js";

export const links: LinksFunction = () => [
  ...(cssBundleHref ? [{ rel: "stylesheet", href: cssBundleHref }] : []),
  { rel: "stylesheet", href: stylesheet },
];

export default function App() {
  const location = useLocation();

  const markup = () => {
    switch (location.pathname) {
      case "/login":
        return <Outlet />;
      default:
        return (
          <>
            <div className="bg-slate-800 h-screen inset-y-0 left-0 w-60 space-y-2 flex flex-col justify-between">
              <NavSidebar />
              <Form method="post" action="/logout">
                <button
                  className="h-12 bg-slate-500 text-lg px-2 flex justify-left items-center space-x-2 w-full"
                  type="submit"
                >
                  <AiOutlineLogout />
                  <p>Logout</p>
                </button>
              </Form>
            </div>
            <div className="container mx-5 mt-2 max-w-6xl">
              <Outlet />
            </div>
          </>
        );
    }
  };

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="bg-slate-900 text-white flex font-display">
        {markup()}
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
