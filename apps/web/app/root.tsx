import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
} from "react-router";

import type { Route } from "./+types/root";

import { ToastProvider } from "@repo/ui/components/ui/toast";
import { Toaster } from "@repo/ui/components/ui/toaster";
import { TooltipProvider } from "@repo/ui/components/ui/tooltip";
import { Layout as LayoutComponent } from "./components/Layout";
import { WalletProvider } from "./context/WalletProvider";

import { SITE_DESCRIPTION, SITE_NAME, SITE_URL, SOCIAL_X } from "@/utils/site";

import rainbowkitStyles from "@rainbow-me/rainbowkit/styles.css?url";
import globalsStyles from "./globals.css?url";

export const links: Route.LinksFunction = () => [
  {
    rel: "icon",
    href: "/images/favicon-96x96.png",
    type: "image/png",
    sizes: "96x96",
  },
  {
    rel: "icon",
    href: "/images/favicon.svg",
    type: "image/svg+xml",
  },
  { rel: "shortcut icon", href: "/favicon.ico" },
  {
    rel: "apple-touch-icon",
    sizes: "180x180",
    href: "/images/apple-touch-icon.png",
  },
  { rel: "manifest", href: "/manifest.json" },
  { rel: "stylesheet", href: globalsStyles },
  { rel: "stylesheet", href: rainbowkitStyles },
];

export const meta: Route.MetaFunction = () => [
  { title: SITE_NAME },
  { name: "description", content: SITE_DESCRIPTION },
  { name: "image", content: `${SITE_URL}/opengraph-image.webp` },
  { name: "og:image", content: `${SITE_URL}/opengraph-image.webp` },
  { name: "og:title", content: SITE_NAME },
  { name: "og:description", content: SITE_DESCRIPTION },
  { name: "og:url", content: SITE_URL },
  { name: "og:type", content: "website" },
  { name: "og:site_name", content: SITE_NAME },
  { name: "twitter:card", content: "summary_large_image" },
  { name: "twitter:image", content: `${SITE_URL}/opengraph-image.webp` },
  { name: "twitter:title", content: SITE_NAME },
  { name: "twitter:description", content: SITE_DESCRIPTION },
  { name: "twitter:site", content: SOCIAL_X },
  { name: "twitter:creator", content: SOCIAL_X },
];

export function HydrateFallback() {
  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body className="bg-background">
        <Scripts />
      </body>
    </html>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return (
    <WalletProvider>
      <ToastProvider>
        <TooltipProvider>
          <LayoutComponent>
            <Outlet />
          </LayoutComponent>
        </TooltipProvider>
        <Toaster />
      </ToastProvider>
    </WalletProvider>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
