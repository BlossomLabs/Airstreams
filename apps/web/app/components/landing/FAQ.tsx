import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@repo/ui/components/ui/accordion";

interface FAQProps {
  question: string;
  answer: string;
  value: string;
}

const FAQList: FAQProps[] = [
  {
    question: "How do Airstreams provide flexibility for token distributions?",
    answer:
      "Airstreams allow you to create customizable distribution plans, enabling tailored start dates and adjustable amounts, including cliffs for bulk distributions at specific times. This flexibility ensures that token distributions align with your project's unique needs and goals.",
    value: "item-1",
  },
  {
    question: "What makes Airstreams secure?",
    answer:
      "Tokens in Airstreams are secured in a Vault contract, offering an additional layer of protection. In case of unexpected changes or emergencies, funds can be withdrawn, ensuring the safety and adaptability of your distribution plan.",
    value: "item-2",
  },
  {
    question: "What role does Superfluid play in powering Airstreams?",
    answer:
      "Airstreams are built on Superfluid's Distribution Pools, a cutting-edge infrastructure for token streaming. This ensures a smooth and reliable distribution mechanism, transforming static airdrops into a dynamic and engaging process.",
    value: "item-3",
  },
  {
    question:
      "How do Airstreams benefit project ecosystems beyond token distribution?",
    answer:
      "By rewarding engagement and encouraging continuous user participation, Airstreams help maintain active communities and foster trust in your ecosystem. This drives sustained interest and growth, reducing speculative behavior often seen with traditional airdrops.",
    value: "item-4",
  },
  {
    question: "Are Airstreams compatible with multiple networks and tokens?",
    answer:
      "Yes, Airstreams currently support all ERC20 tokens on the Sepolia network, with plans to expand to Base and other networks soon. This multi-network compatibility ensures a wide range of projects can adopt this innovative solution.",
    value: "item-5",
  },
];

export const FAQ = () => {
  return (
    <section className="container py-24 sm:py-32 bg-background/60">
      <h2 className="text-3xl md:text-4xl font-bold mb-4 font-header">
        Frequently Asked{" "}
        <span className="bg-gradient-to-b from-primary/60 to-primary text-transparent bg-clip-text">
          Questions
        </span>
      </h2>

      <Accordion type="single" collapsible className="w-full AccordionRoot">
        {FAQList.map(({ question, answer, value }: FAQProps) => (
          <AccordionItem key={value} value={value}>
            <AccordionTrigger className="text-left">
              {question}
            </AccordionTrigger>

            <AccordionContent>{answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <h3 className="font-medium mt-4">
        Still have questions?{" "}
        <a
          rel="noreferrer noopener"
          href="https://blossom.software"
          target="_blank"
          className="text-primary transition-all border-primary hover:border-b-2"
        >
          Contact us
        </a>
      </h3>
    </section>
  );
};
