import type { ChangeEvent } from "react";
import { useState } from "react";
import DialogForm from "@/components/DialogForm";
import UserFields from "@/pages/Douyin/components/UserFields";
import { buildUserCreate, DEFAULT_USER_INPUTS } from "@/pages/Douyin/mappers";
import type { DouyinUserCreate, DouyinUserStatus } from "@/pages/Douyin/types";
import type { System } from "@/pages/Systems/types";

interface CreateUserDialogProps {
  systems: System[];
  statuses: DouyinUserStatus[];
  onSubmit: (data: DouyinUserCreate) => Promise<void>;
}

export default function CreateUserDialog({ systems, statuses, onSubmit }: CreateUserDialogProps) {
  const [inputs, setInputs] = useState(DEFAULT_USER_INPUTS);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setInputs((prev) => ({ ...prev, [name]: value }));
    if (value.trim()) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setInputs((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!inputs.sec_uid.trim()) {
      setErrors({ sec_uid: "Required" });
      return false;
    }
    await onSubmit(buildUserCreate(inputs));
    return true;
  };

  const handleClose = () => {
    setInputs(DEFAULT_USER_INPUTS);
    setErrors({});
  };

  return (
    <DialogForm
      triggerText="+ New User"
      title="New Douyin User"
      okText="Create and fetch"
      onSubmit={handleSubmit}
      onClose={handleClose}
    >
      <UserFields
        inputs={inputs}
        errors={errors}
        systems={systems}
        statuses={statuses}
        onInputChange={handleInputChange}
        onSelectChange={handleSelectChange}
        includeSecUid
      />
    </DialogForm>
  );
}
