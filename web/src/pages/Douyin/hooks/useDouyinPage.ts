import { useCallback, useEffect, useMemo, useState } from "react";
import * as douyinApi from "@/pages/Douyin/api";
import { DEFAULT_STATUSES, VIDEO_PAGE_SIZE } from "@/pages/Douyin/constants";
import {
  getUserDisplayName,
  getUserSecondaryName,
  getVideoDisplayTitle,
  getVideoSecondaryTitle,
} from "@/pages/Douyin/display";
import { formatDateTime } from "@/pages/Douyin/format";
import type {
  DouyinUser,
  DouyinUserCreate,
  DouyinUserStatus,
  DouyinUserUpdate,
  DouyinVideo,
  DouyinVideoUpdate,
} from "@/pages/Douyin/types";
import * as systemApi from "@/pages/Systems/api";
import type { System } from "@/pages/Systems/types";

function normalizeSearch(value: string) {
  return value.trim().toLowerCase();
}

function matchesSearch(values: unknown[], query: string) {
  if (!query) return true;

  return values
    .filter((value) => value !== null && value !== undefined)
    .some((value) => String(value).toLowerCase().includes(query));
}

export default function useDouyinPage() {
  const [activeTab, setActiveTab] = useState<"users" | "videos">("users");
  const [users, setUsers] = useState<DouyinUser[]>([]);
  const [videos, setVideos] = useState<DouyinVideo[]>([]);
  const [videoTotal, setVideoTotal] = useState(0);
  const [videoOffset, setVideoOffset] = useState(0);
  const [videosLoading, setVideosLoading] = useState(false);
  const [systems, setSystems] = useState<System[]>([]);
  const [statuses, setStatuses] = useState<DouyinUserStatus[]>(DEFAULT_STATUSES);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [actionError, setActionError] = useState("");
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [videoSearchQuery, setVideoSearchQuery] = useState("");
  const [editingVideo, setEditingVideo] = useState<DouyinVideo | null>(null);
  const [deletingVideo, setDeletingVideo] = useState<DouyinVideo | null>(null);
  const firstVideoNumber = videoTotal ? videoOffset + 1 : 0;
  const lastVideoNumber = Math.min(videoOffset + videos.length, videoTotal);
  const canGoPrevious = videoOffset > 0 && !videosLoading;
  const canGoNext = videoOffset + VIDEO_PAGE_SIZE < videoTotal && !videosLoading;
  const displayError = loadError || actionError;
  const systemNameById = useMemo(
    () => new Map(systems.map((system) => [system.id, system.name])),
    [systems],
  );
  const userNameById = useMemo(
    () => new Map(users.map((user) => [user.id, getUserDisplayName(user)])),
    [users],
  );
  const filteredUsers = useMemo(() => {
    const query = normalizeSearch(userSearchQuery);
    return users.filter((user) =>
      matchesSearch(
        [
          user.id,
          getUserDisplayName(user),
          getUserSecondaryName(user),
          user.name,
          user.translated_name,
          user.sec_uid,
          user.status,
          user.topic,
          user.niche,
          user.sub_niche,
          user.micro_niche,
          user.note,
          user.system_id ? systemNameById.get(user.system_id) : null,
        ],
        query,
      ),
    );
  }, [systemNameById, userSearchQuery, users]);
  const filteredVideos = useMemo(() => {
    const query = normalizeSearch(videoSearchQuery);
    return videos.filter((video) =>
      matchesSearch(
        [
          video.id,
          video.aweme_id,
          getVideoDisplayTitle(video),
          getVideoSecondaryTitle(video),
          video.title,
          video.translated_title,
          userNameById.get(video.user_id),
          video.user_id,
          video.digg_count,
          formatDateTime(video.create_time),
          video.is_downloaded ? "yes downloaded true" : "no not downloaded false",
        ],
        query,
      ),
    );
  }, [userNameById, videoSearchQuery, videos]);

  const loadVideoPage = useCallback(async (offset: number) => {
    setVideosLoading(true);
    try {
      const page = await douyinApi.getVideoPage({ limit: VIDEO_PAGE_SIZE, offset });
      setVideos(page.items);
      setVideoTotal(page.total);
      setVideoOffset(page.offset);
    } finally {
      setVideosLoading(false);
    }
  }, []);

  const loadData = useCallback(async () => {
    const [nextUsers, nextVideoPage, nextSystems, nextStatuses] = await Promise.all([
      douyinApi.getUsers(),
      douyinApi.getVideoPage({ limit: VIDEO_PAGE_SIZE, offset: 0 }),
      systemApi.getAll(),
      douyinApi.getUserStatuses().catch(() => DEFAULT_STATUSES),
    ]);
    setUsers(nextUsers);
    setVideos(nextVideoPage.items);
    setVideoTotal(nextVideoPage.total);
    setVideoOffset(nextVideoPage.offset);
    setSystems(nextSystems);
    setStatuses(nextStatuses);
  }, []);

  useEffect(() => {
    loadData()
      .catch(() => setLoadError("Could not load Douyin data"))
      .finally(() => setLoading(false));
  }, [loadData]);

  const handleCreateUser = async (data: DouyinUserCreate) => {
    setActionError("");
    try {
      const created = await douyinApi.createUser(data);
      setUsers((prev) => [created, ...prev]);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Could not create user";
      setActionError(message);
      throw new Error(message);
    }
  };

  const handleUpdateUser = async (id: number, data: DouyinUserUpdate) => {
    setActionError("");
    try {
      const updated = await douyinApi.updateUser(id, data);
      setUsers((prev) => prev.map((user) => (user.id === id ? updated : user)));
    } catch (e) {
      const message = e instanceof Error ? e.message : "Could not update user";
      setActionError(message);
      throw new Error(message);
    }
  };

  const handleDeleteUser = async (id: number) => {
    setActionError("");
    try {
      await douyinApi.removeUser(id);
      setUsers((prev) => prev.filter((user) => user.id !== id));
      await loadVideoPage(videoOffset);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Could not delete user";
      setActionError(message);
      throw new Error(message);
    }
  };

  const handleUpdateVideo = async (id: number, data: DouyinVideoUpdate) => {
    setActionError("");
    try {
      await douyinApi.updateVideo(id, data);
      await loadVideoPage(videoOffset);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Could not update video";
      setActionError(message);
      throw new Error(message);
    }
  };

  const handleDeleteVideo = async (id: number) => {
    setActionError("");
    try {
      await douyinApi.removeVideo(id);
      const nextOffset =
        videos.length === 1 && videoOffset > 0
          ? Math.max(0, videoOffset - VIDEO_PAGE_SIZE)
          : videoOffset;
      await loadVideoPage(nextOffset);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Could not delete video";
      setActionError(message);
      throw new Error(message);
    }
  };

  const handlePreviousVideoPage = () => {
    void loadVideoPage(Math.max(0, videoOffset - VIDEO_PAGE_SIZE)).catch(() =>
      setActionError("Could not load videos"),
    );
  };

  const handleNextVideoPage = () => {
    void loadVideoPage(videoOffset + VIDEO_PAGE_SIZE).catch(() =>
      setActionError("Could not load videos"),
    );
  };

  return {
    activeTab,
    canGoNext,
    canGoPrevious,
    deletingVideo,
    displayError,
    editingVideo,
    filteredUsers,
    filteredVideos,
    firstVideoNumber,
    handleCreateUser,
    handleDeleteUser,
    handleDeleteVideo,
    handleNextVideoPage,
    handlePreviousVideoPage,
    handleUpdateUser,
    handleUpdateVideo,
    lastVideoNumber,
    loading,
    setActiveTab,
    setDeletingVideo,
    setEditingVideo,
    setUserSearchQuery,
    setVideoSearchQuery,
    statuses,
    systemNameById,
    systems,
    userNameById,
    users,
    videoTotal,
    userSearchQuery,
    videoSearchQuery,
    videos,
    videosLoading,
  };
}
