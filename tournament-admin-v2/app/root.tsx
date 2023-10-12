import { cssBundleHref } from "@remix-run/css-bundle";
import type { LinksFunction } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import { Container, Theme, ThemePanel } from "@radix-ui/themes";

import stylesheet from "~/tailwind.css";
import radixStylesheet from "@radix-ui/themes/styles.css";

export const links: LinksFunction = () => [
  ...(cssBundleHref ? [{ rel: "stylesheet", href: cssBundleHref }] : []),
  { rel: "stylesheet", href: stylesheet },
  { rel: "stylesheet", href: radixStylesheet },
];

export default function App() {
  return (
    <html lang="en" className="dark">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <Theme>
          <Container>
            <Outlet />
          </Container>
          <ScrollRestoration />
          <Scripts />
          <LiveReload />
          <ThemePanel />
        </Theme>
      </body>
    </html>
  );
}
