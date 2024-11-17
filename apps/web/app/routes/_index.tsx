import { Cta } from "@/components/landing/Cta";
import { Features } from "@/components/landing/Features";
import { Hero } from "@/components/landing/Hero";
import { Sponsors } from "@/components/landing/Sponsors";
import { Radar } from "lucide-react";

export default function Home() {
  const builders = [
    {
      icon: <Radar size={34} />,
      name: "Blossom Labs",
      url: "https://blossom.software",
    },
  ];
  const sponsors = [
    {
      icon: <Radar size={34} />,
      name: "Superfluid",
      url: "https://superfluid.finance",
    },
  ];
  return (
    <>
      <Hero />
      <div className="container flex flex-row justify-between items-center">
        <Sponsors text="Built by" sponsors={builders} />
        <Sponsors sponsors={sponsors} />
      </div>
      <Features />
      <Cta />
    </>
  );
}
