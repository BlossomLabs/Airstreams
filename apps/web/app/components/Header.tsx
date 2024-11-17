import { Link } from "@remix-run/react";
import { Connect } from "./Connect";

export function Header() {
  return (
    <header className="navbar flex justify-between p-4 pt-0 pb-0 bg-secondary min-h-20">
      <Link to="/" className="h-10 w-10 my-auto flex items-center gap-2">
        <img src="/images/logo.svg" alt="Logo" />
        <h1 className="font-header text-3xl font-bold text-primary-foreground pt-2">
          Airstreams
        </h1>
      </Link>

      <div className="flex gap-2 items-center">
        <Connect />
      </div>
    </header>
  );
}
