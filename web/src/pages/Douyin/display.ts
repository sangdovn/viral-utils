import type { DouyinUser, DouyinVideo } from "@/pages/Douyin/types";

export function getUserDisplayName(user: DouyinUser) {
  return user.translated_name || user.name || user.sec_uid;
}

export function getUserSecondaryName(user: DouyinUser) {
  if (user.translated_name && user.name && user.translated_name !== user.name) {
    return user.name;
  }
  return user.sec_uid;
}

export function getVideoDisplayTitle(video: DouyinVideo) {
  return video.translated_title || video.title || video.aweme_id;
}

export function getVideoSecondaryTitle(video: DouyinVideo) {
  if (video.translated_title && video.title && video.translated_title !== video.title) {
    return video.title;
  }
  return video.aweme_id;
}
