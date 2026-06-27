import { AlertCircle } from "lucide-react";
import {
  Page,
  PageHeader,
  PageSubtitle,
  PageTabs,
  PageTitle,
  PageToolbar,
} from "@/components/Page";
import SearchInput from "@/components/SearchInput";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import CreateUserDialog from "@/pages/Douyin/components/CreateUserDialog";
import DeleteVideoDialog from "@/pages/Douyin/components/DeleteVideoDialog";
import EditVideoDialog from "@/pages/Douyin/components/EditVideoDialog";
import UserTable from "@/pages/Douyin/components/UserTable";
import VideoTable from "@/pages/Douyin/components/VideoTable";
import useDouyinPage from "@/pages/Douyin/hooks/useDouyinPage";

export default function Douyin() {
  const {
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
    userSearchQuery,
    videoSearchQuery,
    videoTotal,
    videos,
    videosLoading,
  } = useDouyinPage();
  const activeSearchQuery = activeTab === "users" ? userSearchQuery : videoSearchQuery;
  const pageSubtitle = loading
    ? "Loading..."
    : activeTab === "users" && userSearchQuery
      ? `${filteredUsers.length} of ${users.length} users, ${videoTotal} videos`
      : activeTab === "videos" && videoSearchQuery
        ? `${users.length} users, ${filteredVideos.length} of ${videos.length} videos on this page`
        : `${users.length} users, ${videoTotal} videos`;
  const displayedFirstVideoNumber = videoSearchQuery
    ? filteredVideos.length
      ? 1
      : 0
    : firstVideoNumber;
  const displayedLastVideoNumber = videoSearchQuery ? filteredVideos.length : lastVideoNumber;
  const displayedVideoTotal = videoSearchQuery ? filteredVideos.length : videoTotal;

  return (
    <Page>
      <PageHeader>
        <div>
          <PageTitle>Douyin</PageTitle>
          <PageSubtitle>{pageSubtitle}</PageSubtitle>
        </div>
        {activeTab === "users" && (
          <CreateUserDialog systems={systems} statuses={statuses} onSubmit={handleCreateUser} />
        )}
      </PageHeader>

      {displayError && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{displayError}</AlertDescription>
        </Alert>
      )}

      <PageTabs>
        <Button
          type="button"
          variant={activeTab === "users" ? "secondary" : "ghost"}
          onClick={() => setActiveTab("users")}
        >
          Users
        </Button>
        <Button
          type="button"
          variant={activeTab === "videos" ? "secondary" : "ghost"}
          onClick={() => setActiveTab("videos")}
        >
          Videos
        </Button>
      </PageTabs>

      <PageToolbar>
        <SearchInput
          value={activeSearchQuery}
          onChange={activeTab === "users" ? setUserSearchQuery : setVideoSearchQuery}
          placeholder={activeTab === "users" ? "Search users" : "Search current video page"}
          className="w-full"
        />
      </PageToolbar>

      {activeTab === "users" ? (
        <UserTable
          users={filteredUsers}
          systems={systems}
          statuses={statuses}
          systemNameById={systemNameById}
          loading={loading}
          onUpdate={handleUpdateUser}
          onDelete={handleDeleteUser}
        />
      ) : (
        <>
          <VideoTable
            videos={filteredVideos}
            videoTotal={displayedVideoTotal}
            firstVideoNumber={displayedFirstVideoNumber}
            lastVideoNumber={displayedLastVideoNumber}
            canGoPrevious={canGoPrevious}
            canGoNext={canGoNext}
            loading={loading}
            videosLoading={videosLoading}
            searching={Boolean(videoSearchQuery)}
            userNameById={userNameById}
            onPreviousPage={handlePreviousVideoPage}
            onNextPage={handleNextVideoPage}
            onEdit={setEditingVideo}
            onDelete={setDeletingVideo}
          />
          {editingVideo && (
            <EditVideoDialog
              video={editingVideo}
              onSubmit={handleUpdateVideo}
              open
              onOpenChange={(open) => {
                if (!open) setEditingVideo(null);
              }}
            />
          )}
          {deletingVideo && (
            <DeleteVideoDialog
              video={deletingVideo}
              onDelete={handleDeleteVideo}
              open
              onOpenChange={(open) => {
                if (!open) setDeletingVideo(null);
              }}
            />
          )}
        </>
      )}
    </Page>
  );
}
