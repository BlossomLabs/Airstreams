import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/ui/card";
import cubeLeg from "../../assets/cube-leg.png";
import {
  ChartIcon,
  GiftIcon,
  LightBulbIcon,
  MagnifierIcon,
  MedalIcon,
  WalletIcon,
} from "./Icons";

interface FeaturesProps {
  title: string;
  description: string;
  icon: JSX.Element;
}

const featuresList: FeaturesProps[] = [
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
      "Airstreams currently supports all ERC20 tokens on the Sepolia network, with plans to support Base coming soon.",
    icon: <WalletIcon />,
  },
];

export const Features = () => {
  return (
    <section className="container py-24 sm:py-32">
      <div className="grid gap-8 place-items-center">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold">
            <span className="bg-gradient-to-b from-primary/60 to-primary text-transparent bg-clip-text">
              Why{" "}
            </span>
            Airstreams?
          </h2>

          <p className="text-muted-foreground text-xl mt-4 mb-8 ">
            Lorem ipsum dolor sit amet consectetur, adipisicing elit. Veritatis
            dolor.
          </p>

          <div className="flex flex-col gap-8">
            {featuresList.map(({ icon, title, description }: FeaturesProps) => (
              <Card key={title}>
                <CardHeader className="space-y-1 flex md:flex-row justify-start items-start gap-4">
                  <div className="mt-1 bg-primary/20 p-1 rounded-2xl">
                    {icon}
                  </div>
                  <div>
                    <CardTitle>{title}</CardTitle>
                    <CardDescription className="text-md mt-2">
                      {description}
                    </CardDescription>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>

        <img src={cubeLeg} className="w-[300px] object-contain" alt="" />
      </div>
    </section>
  );
};
