import { NO_SYSTEM_VALUE } from "@/pages/Douyin/constants";
import type {
  DouyinUser,
  DouyinUserCreate,
  DouyinUserStatus,
  DouyinUserUpdate,
  DouyinVideo,
  DouyinVideoUpdate,
} from "@/pages/Douyin/types";

export interface UserInputs {
  sec_uid: string;
  status: DouyinUserStatus;
  system_id: string;
  topic: string;
  niche: string;
  sub_niche: string;
  micro_niche: string;
  note: string;
}

export interface VideoInputs {
  title: string;
  translated_title: string;
  is_downloaded: string;
}

export const DEFAULT_USER_INPUTS: UserInputs = {
  sec_uid: "",
  status: "pending",
  system_id: NO_SYSTEM_VALUE,
  topic: "",
  niche: "",
  sub_niche: "",
  micro_niche: "",
  note: "",
};

function optionalString(value: string) {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

export function userInputsFromUser(user: DouyinUser): UserInputs {
  return {
    sec_uid: user.sec_uid,
    status: user.status,
    system_id: user.system_id ? String(user.system_id) : NO_SYSTEM_VALUE,
    topic: user.topic ?? "",
    niche: user.niche ?? "",
    sub_niche: user.sub_niche ?? "",
    micro_niche: user.micro_niche ?? "",
    note: user.note ?? "",
  };
}

export function buildUserCreate(inputs: UserInputs): DouyinUserCreate {
  return {
    sec_uid: inputs.sec_uid.trim(),
    status: inputs.status,
    system_id: inputs.system_id === NO_SYSTEM_VALUE ? null : Number(inputs.system_id),
    topic: optionalString(inputs.topic),
    niche: optionalString(inputs.niche),
    sub_niche: optionalString(inputs.sub_niche),
    micro_niche: optionalString(inputs.micro_niche),
    note: optionalString(inputs.note),
  };
}

export function buildUserUpdate(inputs: UserInputs): DouyinUserUpdate {
  return {
    status: inputs.status,
    system_id: inputs.system_id === NO_SYSTEM_VALUE ? null : Number(inputs.system_id),
    topic: optionalString(inputs.topic),
    niche: optionalString(inputs.niche),
    sub_niche: optionalString(inputs.sub_niche),
    micro_niche: optionalString(inputs.micro_niche),
    note: optionalString(inputs.note),
  };
}

export function videoInputsFromVideo(video: DouyinVideo): VideoInputs {
  return {
    title: video.title ?? "",
    translated_title: video.translated_title ?? "",
    is_downloaded: String(video.is_downloaded),
  };
}

export function buildVideoUpdate(inputs: VideoInputs): DouyinVideoUpdate {
  return {
    title: optionalString(inputs.title),
    translated_title: optionalString(inputs.translated_title),
    is_downloaded: inputs.is_downloaded === "true",
  };
}
