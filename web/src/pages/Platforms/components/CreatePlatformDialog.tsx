import { useState } from "react";
import DialogForm from "@/components/DialogForm";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { PlatformCreate, PlatformStatus, PlatformType } from "@/pages/Platforms/types";
import type { System } from "@/pages/Systems/types";

interface Props {
  types: string[];
  statuses: string[];
  systems: System[];
  onSubmit: (data: PlatformCreate) => void | Promise<void>;
}

const NO_SYSTEM_VALUE = "__none__";

const DEFAULT_INPUTS = {
  type: "",
  name: "",
  url: "",
  status: "",
  reason: "",
  system_id: NO_SYSTEM_VALUE,
};

const DEFAULT_ERRORS = {
  type: "",
  name: "",
  status: "",
  reason: "",
};

export default function CreatePlatformDialog({ types, statuses, systems, onSubmit }: Props) {
  const [inputs, setInputs] = useState(DEFAULT_INPUTS);
  const [errors, setErrors] = useState(DEFAULT_ERRORS);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setInputs((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setInputs((prev) => ({ ...prev, [name]: value }));
  };

  const isValidFormData = () => {
    const e = { ...DEFAULT_ERRORS };
    if (!inputs.type) e.type = "Required";
    if (inputs.name.trim().length < 2) e.name = "At least 2 characters";
    if (!inputs.status) e.status = "Required";
    setErrors(e);
    if (Object.values(e).some(Boolean)) return false;
    return true;
  };

  const optionalString = (value: string) => {
    const trimmed = value.trim();
    return trimmed ? trimmed : null;
  };

  const handleSubmit = async () => {
    if (!isValidFormData()) return false;
    await onSubmit({
      type: inputs.type as PlatformType,
      name: inputs.name.trim(),
      url: optionalString(inputs.url),
      status: inputs.status as PlatformStatus,
      reason: optionalString(inputs.reason),
      system_id: inputs.system_id === NO_SYSTEM_VALUE ? null : Number(inputs.system_id),
    });
    return true;
  };

  const handleClose = () => {
    setInputs(DEFAULT_INPUTS);
    setErrors(DEFAULT_ERRORS);
  };

  return (
    <DialogForm
      triggerText="+ New Platform"
      title="New Platform"
      onSubmit={handleSubmit}
      onClose={handleClose}
    >
      <FieldGroup>
        <Field>
          <FieldLabel>Type</FieldLabel>
          <Select value={inputs.type} onValueChange={(value) => handleSelectChange("type", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent position="popper">
              <SelectGroup>
                <SelectLabel>Types</SelectLabel>
                {types.map((t) => (
                  <SelectItem key={t} value={String(t)}>
                    {t}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          {errors.type && <p className="text-xs text-red-500">{errors.type}</p>}
        </Field>

        <Field>
          <FieldLabel>Name</FieldLabel>
          <Input name="name" value={inputs.name} onChange={handleInputChange} placeholder="Name" />
          {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
        </Field>

        <Field>
          <FieldLabel>URL</FieldLabel>
          <Input
            name="url"
            value={inputs.url}
            onChange={handleInputChange}
            placeholder="https://"
          />
        </Field>

        <Field>
          <FieldLabel>Status</FieldLabel>
          <Select
            value={inputs.status}
            onValueChange={(value) => handleSelectChange("status", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent position="popper">
              <SelectGroup>
                <SelectLabel>Statuses</SelectLabel>
                {statuses.map((s) => (
                  <SelectItem key={s} value={String(s)}>
                    {s}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          {errors.status && <p className="text-xs text-red-500">{errors.status}</p>}
        </Field>

        <Field>
          <FieldLabel>Reason</FieldLabel>
          <Textarea
            name="reason"
            value={inputs.reason}
            onChange={handleInputChange}
            placeholder="Reason"
          />
        </Field>

        <Field>
          <FieldLabel>System</FieldLabel>
          <Select
            value={inputs.system_id}
            onValueChange={(value) => handleSelectChange("system_id", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select system" />
            </SelectTrigger>
            <SelectContent position="popper">
              <SelectGroup>
                <SelectLabel>Systems</SelectLabel>
                <SelectItem value={NO_SYSTEM_VALUE}>No system</SelectItem>
                {systems.map((s) => (
                  <SelectItem key={s.id} value={String(s.id)}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>
      </FieldGroup>
    </DialogForm>
  );
}
