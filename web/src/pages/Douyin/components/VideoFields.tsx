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
import type { VideoInputs } from "@/pages/Douyin/mappers";

interface VideoFieldsProps {
  inputs: VideoInputs;
  onInputChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSelectChange: (name: string, value: string) => void;
}

export default function VideoFields({ inputs, onInputChange, onSelectChange }: VideoFieldsProps) {
  return (
    <FieldGroup>
      <div className="grid gap-4 md:grid-cols-2">
        <Field>
          <FieldLabel>Title</FieldLabel>
          <Input name="title" value={inputs.title} onChange={onInputChange} />
        </Field>
        <Field>
          <FieldLabel>Translated Title</FieldLabel>
          <Input name="translated_title" value={inputs.translated_title} onChange={onInputChange} />
        </Field>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field>
          <FieldLabel>Downloaded</FieldLabel>
          <Select
            value={inputs.is_downloaded}
            onValueChange={(value) => onSelectChange("is_downloaded", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Downloaded" />
            </SelectTrigger>
            <SelectContent position="popper">
              <SelectGroup>
                <SelectLabel>Downloaded</SelectLabel>
                <SelectItem value="false">false</SelectItem>
                <SelectItem value="true">true</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>
      </div>
    </FieldGroup>
  );
}
