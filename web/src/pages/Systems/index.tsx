import { AlertCircle } from "lucide-react";
import { Page, PageHeader, PageSubtitle, PageTitle, PageToolbar } from "@/components/Page";
import SearchInput from "@/components/SearchInput";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import CreateSystemDialog from "@/pages/Systems/components/CreateSystemDialog";
import SystemsTable from "@/pages/Systems/components/SystemsTable";
import useSystemsPage from "@/pages/Systems/hooks/useSystemsPage";

export default function Systems() {
  const {
    displayError,
    filteredSystems,
    handleCreate,
    handleDelete,
    handleUpdate,
    loading,
    searchQuery,
    setSearchQuery,
    systems,
  } = useSystemsPage();
  const subtitle = loading
    ? "Loading..."
    : searchQuery
      ? `${filteredSystems.length} of ${systems.length} total`
      : `${systems.length} total`;

  return (
    <Page>
      <PageHeader>
        <div>
          <PageTitle>Systems</PageTitle>
          <PageSubtitle>{subtitle}</PageSubtitle>
        </div>
        <CreateSystemDialog onSubmit={handleCreate} />
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
          placeholder="Search systems"
          className="w-full"
        />
      </PageToolbar>

      <SystemsTable
        systems={filteredSystems}
        loading={loading}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
      />
    </Page>
  );
}
