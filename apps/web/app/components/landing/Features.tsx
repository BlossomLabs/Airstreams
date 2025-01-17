import { Features as FeaturesUI } from "@repo/ui/components/landing/Features";
import cubeLeg from "../../assets/cube-leg.png";
import { ChartIcon, MedalIcon, WalletIcon } from "./Icons";

const title = (
  <>
    <span className="bg-gradient-to-b from-primary/60 to-primary text-transparent bg-clip-text">
      Why{" "}
    </span>
    Airstreams?
  </>
);

const description =
  "Airstreams is the ultimate solution for projects aiming to distribute tokens sustainably, foster community engagement, and build trust in their ecosystems.";

const featuresList = [
  {
    title: "Mitigate Sudden Price Drops",
    description:
      "Traditional airdrops often lead to mass sell-offs that cause sudden price drops. Airstreams solves this issue by streaming tokens gradually, reducing the risk of large-scale sell-offs.",
    icon: <ChartIcon />,
  },
  {
    title: "Encourage Active User Engagement",
    description:
      "Instead of one-time token claims, Airstreams incentivizes ongoing user participation. By streaming rewards continuously, users remain actively involved with your project, driving sustained interest and community growth.",
    icon: <MedalIcon />,
  },
  {
    title: "Many Supported Tokens and Networks",
    description:
      "Airstreams currently supports all ERC20 tokens on the Base network, with plans to support other networks soon.",
    icon: <WalletIcon />,
  },
];

export const Features = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <FeaturesUI
        title={title}
        description={description}
        featuresList={featuresList}
        className="drop-shadow-[4px_4px_0_#000]"
      />
      <div className="flex justify-center">
        <img src={cubeLeg} className="w-[300px] object-contain" alt="" />
      </div>
    </div>
  );
};
