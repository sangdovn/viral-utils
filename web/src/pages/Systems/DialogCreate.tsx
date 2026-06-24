import { useState } from "react";
import DialogForm from "@/components/DialogForm";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { SystemCreate } from "@/pages/Systems/types";

interface Props {
  onSubmit: (data: SystemCreate) => void | Promise<void>;
}

const DEFAULT_VALUES = {
  name: "",
  description: "",
};

export default function DialogCreate({ onSubmit }: Props) {
  const [inputs, setInputs] = useState(DEFAULT_VALUES);
  const [errors, setErrors] = useState(DEFAULT_VALUES);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setInputs((prev) => ({ ...prev, [name]: value }));
  };

  const isValidFormData = () => {
    const e = { name: "", description: "" };
    if (inputs.name.trim().length < 2) e.name = "At least 2 characters";
    setErrors(e);
    if (Object.values(e).some(Boolean)) return false;
    return true;
  };

  const handleSubmit = async () => {
    if (!isValidFormData()) return false;
    await onSubmit({
      name: inputs.name.trim(),
      description: inputs.description.trim() || null,
    });
    return true;
  };

  const handleClose = () => {
    setInputs(DEFAULT_VALUES);
    setErrors(DEFAULT_VALUES);
  };

  return (
    <DialogForm
      triggerText="+ New System"
      title="Systems"
      onSubmit={handleSubmit}
      onClose={handleClose}
    >
      <FieldGroup>
        <Field>
          <FieldLabel>Name</FieldLabel>
          <Input name="name" value={inputs.name} onChange={handleInputChange} placeholder="Name" />
          {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
        </Field>
        <Field>
          <FieldLabel>Description</FieldLabel>
          <Input
            name="description"
            value={inputs.description}
            onChange={handleInputChange}
            placeholder="Description"
          />
          {errors.description && <p className="text-xs text-red-500">{errors.description}</p>}
        </Field>
      </FieldGroup>
    </DialogForm>
  );
}
