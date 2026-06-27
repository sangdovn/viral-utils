import { ChevronLeft, ChevronRight, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getVideoDisplayTitle, getVideoSecondaryTitle } from "@/pages/Douyin/display";
import {
  formatCompactNumber,
  formatDateTime,
  formatDuration,
  parseVideoUrls,
} from "@/pages/Douyin/format";
import type { DouyinVideo } from "@/pages/Douyin/types";

interface VideoTableProps {
  videos: DouyinVideo[];
  videoTotal: number;
  firstVideoNumber: number;
  lastVideoNumber: number;
  canGoPrevious: boolean;
  canGoNext: boolean;
  loading: boolean;
  videosLoading: boolean;
  searching: boolean;
  userNameById: Map<number, string>;
  onPreviousPage: () => void;
  onNextPage: () => void;
  onEdit: (video: DouyinVideo) => void;
  onDelete: (video: DouyinVideo) => void;
}

export default function VideoTable({
  videos,
  videoTotal,
  firstVideoNumber,
  lastVideoNumber,
  canGoPrevious,
  canGoNext,
  loading,
  videosLoading,
  searching,
  userNameById,
  onPreviousPage,
  onNextPage,
  onEdit,
  onDelete,
}: VideoTableProps) {
  return (
    <>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm text-muted-foreground">
          {videosLoading
            ? "Loading videos..."
            : searching
              ? `${videos.length} matching on this page`
              : `Showing ${firstVideoNumber}-${lastVideoNumber} of ${videoTotal}`}
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onPreviousPage}
            disabled={!canGoPrevious}
          >
            <ChevronLeft />
            Previous
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onNextPage}
            disabled={!canGoNext}
          >
            Next
            <ChevronRight />
          </Button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <Table className="table-fixed">
          <TableHeader>
            <TableRow>
              <TableHead className="w-28 whitespace-normal leading-tight">Aweme ID</TableHead>
              <TableHead className="w-[28%]">Title</TableHead>
              <TableHead className="w-32">User</TableHead>
              <TableHead className="w-36 whitespace-normal leading-tight">Created Time</TableHead>
              <TableHead className="w-16 whitespace-normal text-right leading-tight">
                Diggs Count
              </TableHead>
              <TableHead className="w-16 text-right">Duration</TableHead>
              <TableHead className="w-32 whitespace-normal leading-tight">Links</TableHead>
              <TableHead className="w-20 whitespace-normal text-center leading-tight">
                Download Status
              </TableHead>
              <TableHead className="w-20 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading || videosLoading ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center text-muted-foreground">
                  Loading...
                </TableCell>
              </TableRow>
            ) : videos.length ? (
              videos.map((video) => {
                const displayTitle = getVideoDisplayTitle(video);
                const secondaryTitle = getVideoSecondaryTitle(video);
                const videoUrls = parseVideoUrls(video.urls ?? "");

                return (
                  <TableRow key={video.id}>
                    <TableCell className="font-medium">
                      <div className="truncate" title={video.aweme_id}>
                        {video.aweme_id}
                      </div>
                    </TableCell>
                    <TableCell className="min-w-0">
                      <div className="truncate" title={displayTitle}>
                        {displayTitle}
                      </div>
                      <div className="truncate text-muted-foreground" title={secondaryTitle}>
                        {secondaryTitle}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div
                        className="truncate"
                        title={String(userNameById.get(video.user_id) || video.user_id)}
                      >
                        {userNameById.get(video.user_id) || video.user_id}
                      </div>
                    </TableCell>
                    <TableCell>{formatDateTime(video.create_time)}</TableCell>
                    <TableCell className="text-right" title={String(video.digg_count)}>
                      {formatCompactNumber(video.digg_count)}
                    </TableCell>
                    <TableCell className="text-right">{formatDuration(video.duration)}</TableCell>
                    <TableCell>
                      {videoUrls.length ? (
                        <div className="flex flex-wrap gap-2">
                          {videoUrls.map((url, index) => (
                            <a
                              key={url}
                              href={url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-sm font-medium text-primary underline-offset-4 hover:underline"
                              title={url}
                            >
                              link{index + 1}
                            </a>
                          ))}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">No links</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {video.is_downloaded ? "Yes" : "No"}
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-end gap-1">
                        <Button
                          type="button"
                          size="icon-sm"
                          aria-label={`Edit video ${displayTitle}`}
                          title="Edit"
                          onClick={() => onEdit(video)}
                        >
                          <Pencil />
                        </Button>
                        <Button
                          type="button"
                          size="icon-sm"
                          variant="outline"
                          aria-label={`Delete video ${displayTitle}`}
                          title="Delete"
                          onClick={() => onDelete(video)}
                        >
                          <Trash2 />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={9} className="text-center text-muted-foreground">
                  No videos
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
