import type { ChangeEvent } from "react";
import { useEffect, useState } from "react";
import DialogForm from "@/components/DialogForm";
import UserFields from "@/pages/Douyin/components/UserFields";
import { buildUserUpdate, userInputsFromUser } from "@/pages/Douyin/mappers";
import type { DouyinUser, DouyinUserStatus, DouyinUserUpdate } from "@/pages/Douyin/types";
import type { System } from "@/pages/Systems/types";

interface EditUserDialogProps {
  user: DouyinUser;
  systems: System[];
  statuses: DouyinUserStatus[];
  onSubmit: (id: number, data: DouyinUserUpdate) => Promise<void>;
}

export default function EditUserDialog({ user, systems, statuses, onSubmit }: EditUserDialogProps) {
  const [inputs, setInputs] = useState(() => userInputsFromUser(user));

  useEffect(() => {
    setInputs(userInputsFromUser(user));
  }, [user]);

  const handleInputChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setInputs((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setInputs((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    await onSubmit(user.id, buildUserUpdate(inputs));
    return true;
  };

  return (
    <DialogForm triggerText="Edit" title="Edit User" onSubmit={handleSubmit}>
      <UserFields
        inputs={inputs}
        systems={systems}
        statuses={statuses}
        onInputChange={handleInputChange}
        onSelectChange={handleSelectChange}
        includeSecUid={false}
      />
    </DialogForm>
  );
}
