import { Button } from "@repo/ui/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/components/ui/table";

import { csvStringToArray } from "@/utils/csv";
import { PlusCircledIcon, TrashIcon } from "@radix-ui/react-icons";
import { cn } from "@repo/ui/lib/utils";
import { useFieldArray } from "react-hook-form";
import type { Form } from "../../../utils/form";
import Field from "./Field";

type MultiFieldProps = {
  form: Form;
  name: "recipients";
  label: string;
  description: string;
  fields: {
    name: "address" | "amount";
    label: string;
    description: string;
    placeholder: string;
    type: "text" | "number" | "address";
    className?: string;
  }[];
  footer: React.ReactNode;
};

function MultiField({
  form,
  name,
  label,
  description,
  fields,
  footer,
}: MultiFieldProps) {
  const {
    fields: _fields,
    append,
    remove,
    insert,
  } = useFieldArray({ name, control: form.control });

  const handlePaste = (index: number) => (pasted: string, e: Event) => {
    const csv = csvStringToArray(pasted);
    if (csv.length === 1 && csv[0] && csv[0].length === 1) return; // Not CSV, paste normally
    // Remove the current row
    remove(index);
    // Insert the new rows, starting from the end
    const reversedCsv = csv.toReversed();
    for (const row of reversedCsv) {
      insert(index, { address: row[0] || "", amount: Number(row[1]) || 0 });
    }
    e.preventDefault();
  };

  return (
    <>
      <Field.FieldTitle label={label} description={description} />
      <Table>
        <TableHeader>
          <TableRow>
            {fields.map((field) => (
              <TableHead
                key={field.name}
                colSpan={3}
                className={field.className}
              >
                {field.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {_fields.map((field, index) => (
            <TableRow key={field.id}>
              {fields.map((field) => (
                <TableCell
                  key={field.name}
                  colSpan={3}
                  className={cn("font-medium", field.className)}
                >
                  <Field
                    form={form}
                    type={field.type}
                    name={`recipients.${index}.${field.name}`}
                    label=""
                    description=""
                    placeholder={field.placeholder}
                    className="mb-0"
                    onPaste={handlePaste(index)}
                  />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>{footer}</TableFooter>
      </Table>

      <div className="flex flex-col min-[400px]:flex-row items-center mt-5">
        <Button
          size="sm"
          type="button"
          onClick={() => append({ address: "", amount: 0 })}
          className="py-2 px-4 rounded-md"
        >
          <span className="text-xl mr-2">
            <PlusCircledIcon />
          </span>{" "}
          Add more
        </Button>
        {_fields.length > 1 ? (
          <Button
            size="sm"
            type="button"
            onClick={() => remove(_fields.length - 1)}
            className="py-2 px-4 rounded-md min-[400px]:ml-2 mt-2 min-[400px]:mt-0"
          >
            <span className="text-xl mr-2">
              <TrashIcon />
            </span>{" "}
            Remove last
          </Button>
        ) : null}
      </div>
    </>
  );
}

export default MultiField;
