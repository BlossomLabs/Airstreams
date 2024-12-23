import { SITE_NAME } from "@/utils/site";
import { Link } from "react-router";
import { ConnectButton } from "./ConnectButton";

export function Navbar() {
  return (
    <header className="flex justify-between px-4 py-0 min-h-20 sticky top-0 z-40 w-full bg-foreground text-primary-foreground border-b-[1px]">
      <Link to="/" className="h-10 w-10 my-auto flex items-center gap-2">
        <img src="/images/logo.svg" alt="Logo" />
        <h1 className="hidden sm:block font-header text-3xl font-bold text-primary-foreground pt-2">
          {SITE_NAME}
        </h1>
      </Link>

      <div className="flex gap-2 items-center">
        <ConnectButton />
      </div>
    </header>
  );
}
