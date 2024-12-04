import { Sponsors as SponsorsUI } from "@repo/ui/components/landing/Sponsors";

const builders = [
  {
    logo: (
      <img
        src="/images/blossom-logo.svg"
        alt="Blossom Labs"
        className="h-10 scale-125"
      />
    ),
    href: "https://blossom.software",
  },
];
const sponsors = [
  {
    logo: (
      <img
        src="/images/superfluid-logo.svg"
        alt="Superfluid"
        className="h-10"
      />
    ),
    href: "https://superfluid.finance",
  },
];

export const Sponsors = () => {
  return (
    <div className="container flex flex-col sm:flex-row justify-between items-center max-w-4xl mx-auto">
      <SponsorsUI text="Built by" sponsors={builders} />
      <SponsorsUI text="Powered by" sponsors={sponsors} />
    </div>
  );
};
