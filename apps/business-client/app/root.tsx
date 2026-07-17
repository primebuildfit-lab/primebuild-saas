import { Links, Meta, Outlet, Scripts, ScrollRestoration } from "react-router";
import type { LinksFunction, MetaFunction } from "react-router";

import stylesheet from "./app.css?url";
import { PwaRuntime } from "~/components/pwa/PwaRuntime";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesheet },
  { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
  { rel: "alternate icon", href: "/favicon.ico" },
  { rel: "apple-touch-icon", href: "/icons/apple-touch-icon.png" },
  { rel: "manifest", href: "/manifest.webmanifest" },
];

export const meta: MetaFunction = () => [
  { title: "Eventra Business" },
  { name: "application-name", content: "Eventra Business" },
  { name: "apple-mobile-web-app-title", content: "Eventra" },
  { name: "apple-mobile-web-app-capable", content: "yes" },
  { name: "mobile-web-app-capable", content: "yes" },
  { name: "apple-mobile-web-app-status-bar-style", content: "default" },
  { name: "theme-color", content: "#4f46e5" },
];

export default function App() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <link rel="preconnect" href="https://cdn.shopify.com/" />
        <link
          rel="stylesheet"
          href="https://cdn.shopify.com/static/fonts/inter/v4/styles.css"
        />
        <Meta />
        <Links />
      </head>
      <body>
        <PwaRuntime />
        <Outlet />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
