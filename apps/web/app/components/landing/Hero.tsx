import { SOCIAL_GITHUB } from "@/utils/site";
import { GitHubLogoIcon } from "@radix-ui/react-icons";
import { Button } from "@repo/ui/components/ui/button";
import { buttonVariants } from "@repo/ui/components/ui/button";
import { useNavigate } from "react-router";

export const Hero = () => {
  const navigate = useNavigate();
  return (
    <section className="container grid place-items-center py-20 md:py-32 gap-10 max-w-4xl mx-auto">
      <div className="text-center space-y-6">
        <main className="text-4xl md:text-5xl font-header">
          <h1 className="inline">
            <span className="inline bg-gradient-to-r from-primary/60 to-primary text-transparent bg-clip-text">
              Airstreaming
            </span>{" "}
          </h1>{" "}
          Rewards{" "}
          <h2 className="inline">
            for Long-Term{" "}
            <span className="inline bg-gradient-to-r from-primary/60 to-[#FACC15] text-transparent bg-clip-text">
              Alignment
            </span>
          </h2>
        </main>

        <p className="text-lg lg:text-xl text-muted-foreground md:w-10/12 mx-auto">
          Airstreams deliver continuous airdrops, encouraging active user
          engagement and mitigating sudden price drops.
        </p>

        <div className="pt-6 space-y-4 md:space-y-0 md:space-x-4">
          <Button
            className={`w-full md:w-1/3 ${buttonVariants({
              size: "lg",
            })}`}
            onClick={() => {
              navigate("/create");
            }}
          >
            Create an Airstream
          </Button>

          <a
            rel="noreferrer noopener"
            href={`https://github.com/${SOCIAL_GITHUB}`}
            target="_blank"
            className={`w-full md:w-1/3 ${buttonVariants({
              variant: "outline",
              size: "lg",
            })}`}
          >
            Github Repository
            <GitHubLogoIcon className="ml-2 w-5 h-5" />
          </a>
        </div>
      </div>
    </section>
  );
};
