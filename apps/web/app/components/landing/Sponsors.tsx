interface SponsorProps {
  icon: JSX.Element;
  name: string;
  url: string;
}

export const Sponsors = ({
  text = "Powered by",
  sponsors,
}: { text?: string; sponsors: SponsorProps[] }) => {
  return (
    <section className="container pt-24 sm:py-32">
      <h2 className="text-center text-md lg:text-xl font-bold mb-8 text-primary">
        {text}
      </h2>

      <div className="flex flex-wrap justify-center items-center gap-4 md:gap-8">
        {sponsors.map(({ icon, name, url }: SponsorProps) => (
          <a
            key={name}
            href={url}
            target="_blank"
            rel="noreferrer noopener"
            className="flex items-center gap-1 text-muted-foreground/60"
          >
            <span>{icon}</span>
            <h3 className="text-xl  font-bold">{name}</h3>
          </a>
        ))}
      </div>
    </section>
  );
};
