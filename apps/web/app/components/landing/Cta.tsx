import { Button } from "@repo/ui/components/ui/button";

export const Cta = () => {
  return (
    <section id="cta" className="bg-muted/50 py-16 my-24 sm:my-32">
      <div className="container place-items-center">
        <div className="lg:col-start-1">
          <h2 className="text-3xl md:text-4xl font-bold ">
            Need more
            <span className="bg-gradient-to-b from-primary/60 to-primary text-transparent bg-clip-text">
              {" "}
              Information?{" "}
            </span>
          </h2>
          <p className="text-muted-foreground text-xl mt-4 mb-8 lg:mb-0">
            Partnering with Superfluid, we deliver the ultimate airstreaming
            experience. Request a demo to see it in action or learn more about
            Superfluid technology.
          </p>
        </div>

        <div className="space-y-4 lg:col-start-2">
          <Button
            className="w-full md:mr-4 md:w-auto"
            onClick={() => {
              window.open("https://use.superfluid.finance/demo", "_blank");
            }}
          >
            Request a Demo
          </Button>
          <Button
            variant="outline"
            className="w-full md:w-auto"
            onClick={() => {
              window.open("https://superfluid.finance", "_blank");
            }}
          >
            Discover Superfluid
          </Button>
        </div>
      </div>
    </section>
  );
};
