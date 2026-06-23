import { useEffect, useState } from "react";
import DialogForm from "@/components/DialogForm";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { System, SystemEdit } from "@/pages/Systems/types";

interface Props {
  system: System;
  onSubmit: (id: number, data: SystemEdit) => void;
}

export default function DialogEdit({ system, onSubmit }: Props) {
  const [inputs, setInputs] = useState({
    name: system.name,
    description: system.description,
  });
  const [errors, setErrors] = useState({
    name: "",
    description: "",
  });

  useEffect(() => {
    setInputs({ name: system.name, description: system.description });
  }, [system]);

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

  const handleSubmit = () => {
    if (!isValidFormData()) return false;
    onSubmit(system.id, inputs);
    return true;
  };

  const handleClose = () => {
    setErrors({ name: "", description: "" });
  };

  return (
    <DialogForm triggerText="Edit" title="Edit" onSubmit={handleSubmit} onClose={handleClose}>
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
