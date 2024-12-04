import React, { type PropsWithChildren } from "react";
import { Footer } from "./Footer";
import { Navbar } from "./Navbar";

export function Layout(props: PropsWithChildren) {
  return (
    <div
      className="min-h-screen bg-fixed"
      style={{ backgroundImage: 'url("/images/bg.svg"' }}
    >
      <Navbar />
      {props.children}
      <Footer />
    </div>
  );
}
