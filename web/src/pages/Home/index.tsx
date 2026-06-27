import { Page, PageHeader, PageSubtitle, PageTitle } from "@/components/Page";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <Page>
      <PageHeader>
        <div>
          <PageTitle>Home</PageTitle>
          <PageSubtitle>Choose a page from the sidebar.</PageSubtitle>
        </div>
      </PageHeader>

      <Card>
        <CardHeader>
          <CardTitle>Workspace</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            The Douyin page now contains only user and video CRUD flows.
          </p>
        </CardContent>
      </Card>
    </Page>
  );
}
