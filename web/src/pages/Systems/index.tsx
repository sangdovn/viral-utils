import { useEffect, useState } from "react";
import Button from "@/components/Button";
import { Card, CardLabel } from "@/components/Card";
import Notice from "@/components/Notice";
import { Page, PageHeader, Subtitle, Title } from "@/components/Page";
import Table from "@/components/Table";
import * as api from "@/pages/Systems/api";
import Form from "@/pages/Systems/Form";
import type { FormData, System } from "@/pages/Systems/types";

export default function Systems() {
  const [systems, setSystems] = useState<System[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    api
      .getAll()
      .then(setSystems)
      .catch(() => setError("Could not load systems"))
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async (data: FormData) => {
    const created = await api.create(data);
    setSystems((prev) => [created, ...prev]);
    setShowCreate(false);
  };

  const handleUpdate = async (id: number, data: FormData) => {
    const updated = await api.update(id, data);
    setSystems((prev) => prev.map((s) => (s.id === id ? updated : s)));
    setEditingId(null);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this systems?")) return;
    await api.remove(id);
    setSystems((prev) => prev.filter((s) => s.id !== id));
  };

  return (
    <Page>
      <PageHeader>
        <div>
          <Title>Systems</Title>
          <Subtitle>{systems.length} total</Subtitle>
        </div>
        <Button
          variant="primary"
          onClick={() => {
            setShowCreate(true);
            setEditingId(null);
          }}
        >
          + New System
        </Button>
      </PageHeader>

      {/* States */}
      {loading && <Notice>Loading...</Notice>}
      {error && <Notice variant="danger">{error}</Notice>}

      {/* Create Row */}
      {showCreate && (
        <Card>
          <CardLabel>New System</CardLabel>
          <Form onSubmit={handleCreate} onCancel={() => setShowCreate(false)} />
        </Card>
      )}

      {/* Table */}
      {!loading && (
        <Card>
          {systems.length === 0 ? (
            <p className="py-8 text-center text-gray-400">No systems yet. Create one above!</p>
          ) : (
            <Table
              data={systems}
              expandedId={editingId}
              expanded={(system) => (
                <Form
                  defaultValues={{ name: system.name, description: system.description }}
                  onSubmit={(data) => handleUpdate(system.id, data)}
                  onCancel={() => setEditingId(null)}
                />
              )}
              columns={[
                {
                  label: "ID",
                  width: "60px",
                  render: (s) => <span className="text-gray-400">#{s.id}</span>,
                },
                {
                  label: "Name",
                  width: "200px",
                  render: (s) => <span className="font-medium">{s.name}</span>,
                },
                {
                  label: "Description",
                  render: (s) => <span className="text-gray-500">{s.description}</span>,
                },
                {
                  label: "Actions",
                  width: "160px",
                  align: "right",
                  render: (s) => (
                    <div className="flex justify-end gap-1.5">
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setEditingId(s.id);
                          setShowCreate(false);
                        }}
                      >
                        ✏️ Edit
                      </Button>
                      <Button variant="danger" onClick={() => handleDelete(s.id)}>
                        🗑 Delete
                      </Button>
                    </div>
                  ),
                },
              ]}
            />
          )}
        </Card>
      )}
    </Page>
  );
}
