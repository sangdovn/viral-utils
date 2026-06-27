import type { ChangeEvent } from "react";
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
import { NO_SYSTEM_VALUE } from "@/pages/Douyin/constants";
import type { UserInputs } from "@/pages/Douyin/mappers";
import type { DouyinUserStatus } from "@/pages/Douyin/types";
import type { System } from "@/pages/Systems/types";

interface UserFieldsProps {
  inputs: UserInputs;
  errors?: Record<string, string>;
  systems: System[];
  statuses: DouyinUserStatus[];
  onInputChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSelectChange: (name: string, value: string) => void;
  includeSecUid: boolean;
}

export default function UserFields({
  inputs,
  errors = {},
  systems,
  statuses,
  onInputChange,
  onSelectChange,
  includeSecUid,
}: UserFieldsProps) {
  return (
    <FieldGroup>
      {includeSecUid && (
        <Field>
          <FieldLabel>Sec UID</FieldLabel>
          <Input name="sec_uid" value={inputs.sec_uid} onChange={onInputChange} />
          {errors.sec_uid && <p className="text-xs text-red-500">{errors.sec_uid}</p>}
        </Field>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Field>
          <FieldLabel>Status</FieldLabel>
          <Select value={inputs.status} onValueChange={(value) => onSelectChange("status", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent position="popper">
              <SelectGroup>
                <SelectLabel>Statuses</SelectLabel>
                {statuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>

        <Field>
          <FieldLabel>System</FieldLabel>
          <Select
            value={inputs.system_id}
            onValueChange={(value) => onSelectChange("system_id", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select system" />
            </SelectTrigger>
            <SelectContent position="popper">
              <SelectGroup>
                <SelectLabel>Systems</SelectLabel>
                <SelectItem value={NO_SYSTEM_VALUE}>No system</SelectItem>
                {systems.map((system) => (
                  <SelectItem key={system.id} value={String(system.id)}>
                    {system.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field>
          <FieldLabel>Topic</FieldLabel>
          <Input name="topic" value={inputs.topic} onChange={onInputChange} />
        </Field>
        <Field>
          <FieldLabel>Niche</FieldLabel>
          <Input name="niche" value={inputs.niche} onChange={onInputChange} />
        </Field>
        <Field>
          <FieldLabel>Sub Niche</FieldLabel>
          <Input name="sub_niche" value={inputs.sub_niche} onChange={onInputChange} />
        </Field>
        <Field>
          <FieldLabel>Micro Niche</FieldLabel>
          <Input name="micro_niche" value={inputs.micro_niche} onChange={onInputChange} />
        </Field>
      </div>

      <Field>
        <FieldLabel>Note</FieldLabel>
        <Textarea name="note" value={inputs.note} onChange={onInputChange} />
      </Field>
    </FieldGroup>
  );
}
