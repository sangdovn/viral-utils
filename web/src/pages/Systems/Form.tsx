import { useState } from "react";
import Button from "@/components/Button";
import { Input } from "@/components/Input";
import Text from "@/components/Text";
import type { FormData } from "@/pages/Systems/types";

export default function Form({
  defaultValues,
  onSubmit,
  onCancel,
}: {
  defaultValues?: FormData;
  onSubmit: (data: FormData) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(defaultValues?.name ?? "");
  const [description, setDescription] = useState(defaultValues?.description ?? "");
  const [errors, setErrors] = useState({ name: "", description: "" });

  const validate = () => {
    const e = { name: "", description: "" };
    if (name.trim().length < 2) e.name = "At least 2 characters";
    setErrors(e);
    return !e.name && !e.description;
  };

  const handleSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();
    if (validate()) onSubmit({ name, description });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex flex-start gap-8 wrap">
        <div className="flex flex-col flex-1 min-w-35">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" />
          {errors.name && <Text variant="error">{errors.name}</Text>}
        </div>
        <div className="flex flex-col flex-1 min-w-35">
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description"
          />
          {errors.description && <Text variant="error">{errors.description}</Text>}
        </div>
        <Button variant="primary" type="submit">
          Save
        </Button>
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
