import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@repo/ui/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/ui/select";
import { cn } from "@repo/ui/lib/utils";
import type { FieldName, Form } from "../../../utils/form";
import Field from "./Field";

type SelectFieldProps = {
  form: Form;
  name: FieldName;
  label?: string;
  description?: string;
  placeholder?: string;
  className?: string;
  options: {
    value: string;
    label: string;
  }[];
};

function SelectField({
  form,
  name,
  label,
  description,
  placeholder,
  className,
  options,
}: SelectFieldProps) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className={cn("mb-8", className)}>
          <Field.FieldTitle label={label} description={description} />
          <Select
            onValueChange={field.onChange}
            defaultValue={String(field.value)}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export default SelectField;
