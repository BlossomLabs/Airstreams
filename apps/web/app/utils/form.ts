import { zodResolver } from "@hookform/resolvers/zod";
import { type UseFormReturn, useForm } from "react-hook-form";
import { z } from "zod";

export type Form = UseFormReturn<z.infer<typeof formSchema>>;
export type FormValues = z.infer<typeof formSchema>;
export type FieldName =
  | "distributionToken"
  | `recipients.${number}.address`
  | `recipients.${number}.amount`
  | "airstreamDuration.amount"
  | "airstreamDuration.unit";

export const formSchema = z.object({
  distributionToken: z.string().min(1),
  recipients: z
    .array(
      z.object({
        // Tokenholders
        address: z
          .string()
          .startsWith("0x")
          .length(42)
          .or(z.string().endsWith(".eth")), // Address or ENS name
        amount: z.coerce.number().min(1), // Amount of tokens
      }),
    )
    .min(1),
  airstreamDuration: z.object({
    amount: z.coerce.number().min(1),
    unit: z.enum(["years", "months", "days", "hours", "minutes"]),
  }),
});

export function useCreateAirstreamForm() {
  return useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      distributionToken: "0x30a6933ca9230361972e413a15dc8114c952414e",
      recipients: [{ address: "", amount: 0 }],
      airstreamDuration: { amount: 0, unit: "years" },
    },
  });
}
