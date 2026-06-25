import { AlertCircle } from "lucide-react";
import { Page, PageHeader, PageSubtitle, PageTitle, PageToolbar } from "@/components/Page";
import SearchInput from "@/components/SearchInput";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import CreatePlatformDialog from "@/pages/Platforms/CreatePlatformDialog";
import PlatformsTable from "@/pages/Platforms/PlatformsTable";
import usePlatformsPage from "@/pages/Platforms/usePlatformsPage";

export default function Platforms() {
  const {
    displayError,
    filteredPlatforms,
    handleCreate,
    handleDelete,
    handleUpdate,
    loading,
    platforms,
    searchQuery,
    setSearchQuery,
    statuses,
    systems,
    types,
  } = usePlatformsPage();
  const subtitle = loading
    ? "Loading..."
    : searchQuery
      ? `${filteredPlatforms.length} of ${platforms.length} total`
      : `${platforms.length} total`;

  return (
    <Page>
      <PageHeader>
        <div>
          <PageTitle>Platforms</PageTitle>
          <PageSubtitle>{subtitle}</PageSubtitle>
        </div>
        <CreatePlatformDialog
          types={types}
          statuses={statuses}
          systems={systems}
          onSubmit={handleCreate}
        />
      </PageHeader>

      {displayError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{displayError}</AlertDescription>
        </Alert>
      )}

      <PageToolbar>
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search platforms"
          className="w-full"
        />
      </PageToolbar>

      <PlatformsTable
        platforms={filteredPlatforms}
        types={types}
        statuses={statuses}
        systems={systems}
        loading={loading}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
      />
    </Page>
  );
}
