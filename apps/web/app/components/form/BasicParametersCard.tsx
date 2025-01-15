import Field from "./shared/Field";
import FormCard from "./shared/FormCard";

import { TableCell, TableRow } from "@repo/ui/components/ui/table";
import { useWatch } from "react-hook-form";
import type { Form } from "../../utils/form";
import MultiField from "./shared/MultiField";
import SelectField from "./shared/SelectField";

const Total = ({ control }: { control: Form["control"] }) => {
  const formValues = useWatch({
    name: "recipients",
    control,
  });
  const total = formValues.reduce(
    (acc, current) => acc + Number(current.amount || 0),
    0,
  );
  return total;
};

function BasicParametersCard({ form }: { form: Form }) {
  return (
    <FormCard
      title="Basic parameters"
      description="The settings below will determine the amount of tokens that will be distributed and the duration of the airstream."
    >
      <Field
        type="text"
        form={form}
        name="name"
        label="Airstream Name"
        description="The name of the airstream."
        placeholder="e.g. My Airstream"
      />
      <Field
        type="address"
        form={form}
        name="distributionToken"
        label="SuperToken address"
        description="The address of the supertoken to be distributed."
        placeholder="e.g. 0x1234567890abcdef1234567890abcdef12345678"
      />
      <div className="flex gap-4">
        <Field
          type="number"
          form={form}
          name="airstreamDuration.amount"
          label="Airstream duration"
          description="The duration of the airstream."
          placeholder="0"
          className="w-full"
        />
        <SelectField
          form={form}
          name="airstreamDuration.unit"
          placeholder="Select a unit"
          className="mt-6"
          options={[
            { value: "years", label: "Years" },
            { value: "months", label: "Months" },
            { value: "days", label: "Days" },
            { value: "hours", label: "Hours" },
            { value: "minutes", label: "Minutes" },
          ]}
        />
      </div>
      <MultiField
        form={form}
        name="recipients"
        label="Recipients"
        description="The addresses and amounts of the recipients."
        fields={[
          {
            name: "address",
            type: "address",
            label: "Address",
            description: "The address of the recipient.",
            placeholder: "0x1234567890abcdef1234567890abcdef12345678",
          },
          {
            name: "amount",
            type: "number",
            label: "Amount",
            description:
              "The amount of tokens to be distributed to the address.",
            placeholder: "1000",
            className: "w-1/4",
          },
        ]}
        footer={
          <TableRow>
            <TableCell colSpan={3}>Total</TableCell>
            <TableCell className="text-right">
              <Total control={form.control} />
            </TableCell>
          </TableRow>
        }
      />
    </FormCard>
  );
}

export default BasicParametersCard;
