import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { FormData } from "@/pages/Systems/types";

interface Props {
  onSubmit: (data: FormData) => void;
}

const DEFAULT_VALUES = {
  name: "",
  description: "",
};

export default function DialogCreate({ onSubmit }: Props) {
  const [open, setOpen] = useState(false);
  const [inputs, setInputs] = useState(DEFAULT_VALUES);
  const [errors, setErrors] = useState(DEFAULT_VALUES);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setInputs((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const e = { name: "", description: "" };
    if (inputs.name.trim().length < 2) e.name = "At least 2 characters";
    setErrors(e);
    return !e.name && !e.description;
  };

  const handleSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit(inputs);
    setOpen(false);
  };

  const handleOpenChange = (state: boolean) => {
    setOpen(state);
    if (state === false) return;
    setInputs(DEFAULT_VALUES);
    setErrors(DEFAULT_VALUES);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>+ New System</Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>New System</DialogTitle>
            <DialogDescription>Fill in the details below.</DialogDescription>
          </DialogHeader>
          <FieldGroup className="py-4">
            <Field>
              <FieldLabel>Name</FieldLabel>
              <Input
                name="name"
                value={inputs.name}
                onChange={handleInputChange}
                placeholder="Name"
              />
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
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit">Save changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
