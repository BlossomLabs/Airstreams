import React, { type PropsWithChildren } from "react";
import { Footer } from "./Footer";
import { Header } from "./Header";

export function Layout(props: PropsWithChildren) {
  return (
    <div
      className="flex flex-col min-h-screen bg-cover bg-center"
      style={{ backgroundImage: 'url("/images/bg.svg"' }}
    >
      <Header />
      <main className="flex-grow px-4 container max-w-3xl mx-auto">
        {props.children}
      </main>
      <Footer />
    </div>
  );
}
