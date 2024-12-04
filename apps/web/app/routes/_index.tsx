import { Cta } from "@/components/landing/Cta";
import { FAQ } from "@/components/landing/FAQ";
import { Features } from "@/components/landing/Features";
import { Hero } from "@/components/landing/Hero";
import { Sponsors } from "@/components/landing/Sponsors";
export default function Home() {
  return (
    <>
      <Hero />
      <Sponsors />
      <Features />
      <FAQ />
      <Cta />
    </>
  );
}
