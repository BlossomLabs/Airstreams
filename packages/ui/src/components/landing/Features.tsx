import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/ui/card";

interface FeaturesProps {
  title: string;
  description: string;
  icon: JSX.Element;
}

export const Features = ({
  title,
  description,
  featuresList,
  className,
}: {
  title: React.ReactNode;
  description: string;
  featuresList: FeaturesProps[];
  className?: string;
}) => {
  return (
    <section className={"container py-24 sm:py-32"}>
      <div className="grid gap-8 place-items-center">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold font-header">
            {title}
          </h2>

          <p className="text-muted-foreground md:text-lg mt-4 mb-8 ">
            {description}
          </p>

          <div className="flex flex-col gap-8">
            {featuresList.map(({ icon, title, description }: FeaturesProps) => (
              <Card key={title} className={className}>
                <CardHeader className="space-y-1 flex items-center md:flex-row md:justify-start md:items-start gap-4">
                  <div className="mt-1 bg-primary/20 p-1 rounded-2xl">
                    {icon}
                  </div>
                  <div className="text-center md:text-left">
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
      </div>
    </section>
  );
};
