import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { FormData, PlatformStatus, PlatformType } from "./types";

interface FormProps {
  defaultValues?: FormData;
  onSubmit: (data: FormData) => void;
  onCancel: () => void;
}

export default function PlatformForm({ defaultValues, onSubmit, onCancel }: FormProps) {
  const [type, setType] = useState<PlatformType | null>(defaultValues?.type ?? null);
  const [name, setName] = useState(defaultValues?.name ?? "");
  const [url, setUrl] = useState(defaultValues?.url ?? "");
  const [status, setStatus] = useState<PlatformStatus | null>(defaultValues?.status ?? null);
  const [reason, setReason] = useState(defaultValues?.url ?? "");
  const [systemId, setSystemId] = useState<number | null>(null);

  const validate = () => {
    const e = {
      type: "",
      name: "",
      status: "",
    };

    if (!type) e.type = "Select a type";
    if (name.trim().length < 2) e.name = "At least 2 characters";
    if (!status) e.status = "Select a status";

    return !e.type && !e.name && !e.status;
  };

  const handleSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();
    if (validate())
      onSubmit({
        type,
        name,
        url,
        status,
        reason,
        system_id,
      });
  };
  return (
    <form onSubmit={handleSubmit}>
      <Button>Click me</Button>
    </form>
  );
}
