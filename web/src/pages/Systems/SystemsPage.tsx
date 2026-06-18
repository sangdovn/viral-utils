import { Fragment, useEffect, useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type System = {
  id: number;
  name: string;
  description: string;
};

type FormData = Omit<System, "id">;

// ─── API ──────────────────────────────────────────────────────────────────────

const apiUrl = import.meta.env.VITE_API_URL;

const api = {
  getAll: async (): Promise<System[]> => {
    const res = await fetch(`${apiUrl}/systems`);
    if (!res.ok) throw new Error("Failed to fetch systems");
    return res.json();
  },
  create: async (data: FormData): Promise<System> => {
    const res = await fetch(`${apiUrl}/systems`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to create system");
    return res.json();
  },
  update: async (id: number, data: FormData): Promise<System> => {
    const res = await fetch(`${apiUrl}/systems/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to update system");
    return res.json();
  },
  delete: async (id: number): Promise<void> => {
    const res = await fetch(`${apiUrl}/systems/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to delete system");
  },
};

// ─── Form ─────────────────────────────────────────────────────────────────────

function SystemForm({
  defaultValues,
  onSubmit,
  onCancel,
}: {
  defaultValues?: FormData;
  onSubmit: (data: FormData) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(defaultValues?.name ?? "");
  const [description, setDescription] = useState(defaultValues?.description ?? "");
  const [errors, setErrors] = useState({ name: "", description: "" });

  const validate = () => {
    const e = { name: "", description: "" };
    if (name.trim().length < 2) e.name = "At least 2 characters";
    setErrors(e);
    return !e.name && !e.description;
  };

  const handleSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();
    if (validate()) onSubmit({ name, description });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={s.fieldRow}>
        <div style={s.field}>
          <input
            style={s.input}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name"
          />
          {errors.name && <span style={s.error}>{errors.name}</span>}
        </div>
        <div style={s.field}>
          <input
            style={s.input}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description"
          />
          {errors.description && <span style={s.error}>{errors.description}</span>}
        </div>
        <button type="submit" style={s.btnPrimary}>
          Save
        </button>
        <button type="button" style={s.btnGhost} onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SystemsPage() {
  const [systems, setSystems] = useState<System[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    api
      .getAll()
      .then(setSystems)
      .catch(() => setError("Could not load systems."))
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async (data: FormData) => {
    console.log(data);
    const system = await api.create(data);
    setSystems((prev) => [...prev, system]);
    setShowCreate(false);
  };

  const handleUpdate = async (id: number, data: FormData) => {
    const updated = await api.update(id, data);
    setSystems((prev) => prev.map((s) => (s.id === id ? updated : s)));
    setEditingId(null);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this system?")) return;
    await api.delete(id);
    setSystems((prev) => prev.filter((s) => s.id !== id));
  };

  return (
    <div style={s.page}>
      {/* Header */}
      <div style={s.header}>
        <div>
          <h1 style={s.title}>Systems</h1>
          <p style={s.subtitle}>{systems.length} total</p>
        </div>
        <button
          type="button"
          style={s.btnPrimary}
          onClick={() => {
            setShowCreate(true);
            setEditingId(null);
          }}
        >
          + New System
        </button>
      </div>

      {/* States */}
      {loading && <div style={s.notice}>Loading...</div>}
      {error && <div style={{ ...s.notice, color: "#dc2626", background: "#fef2f2" }}>{error}</div>}

      {/* Create Row */}
      {showCreate && (
        <div style={s.card}>
          <p style={s.cardLabel}>New System</p>
          <SystemForm onSubmit={handleCreate} onCancel={() => setShowCreate(false)} />
        </div>
      )}

      {/* Table */}
      {!loading && (
        <div style={s.card}>
          {systems.length === 0 ? (
            <p style={{ color: "#9ca3af", textAlign: "center", padding: "32px 0" }}>
              No systems yet. Create one above!
            </p>
          ) : (
            <table style={s.table}>
              <thead>
                <tr style={s.theadRow}>
                  <th style={s.th}>ID</th>
                  <th style={s.th}>Name</th>
                  <th style={s.th}>Email</th>
                  <th style={{ ...s.th, textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {systems.map((system) => (
                  <Fragment key={system.id}>
                    <tr style={s.tr}>
                      <td style={{ ...s.td, color: "#9ca3af", width: 40 }}>#{system.id}</td>
                      <td style={{ ...s.td, fontWeight: 500 }}>{system.name}</td>
                      <td style={{ ...s.td, color: "#6b7280" }}>{system.description}</td>
                      <td style={{ ...s.td, textAlign: "right" }}>
                        <button
                          type="button"
                          style={s.btnGhost}
                          onClick={() => {
                            setEditingId(system.id);
                            setShowCreate(false);
                          }}
                        >
                          ✏️ Edit
                        </button>
                        <button
                          type="button"
                          style={s.btnDanger}
                          onClick={() => handleDelete(system.id)}
                        >
                          🗑 Delete
                        </button>
                      </td>
                    </tr>

                    {/* Inline Edit */}
                    {editingId === system.id && (
                      <tr key={`edit-${system.id}`}>
                        <td colSpan={4} style={{ ...s.td, background: "#f9fafb", borderRadius: 8 }}>
                          <SystemForm
                            defaultValues={{ name: system.name, description: system.description }}
                            onSubmit={(data) => handleUpdate(system.id, data)}
                            onCancel={() => setEditingId(null)}
                          />
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s: Record<string, React.CSSProperties> = {
  page: {
    maxWidth: 760,
    margin: "40px auto",
    padding: "0 20px",
    fontFamily: "Inter, system-ui, sans-serif",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
  },
  title: { fontSize: 22, fontWeight: 700, margin: 0, color: "#111827" },
  subtitle: { fontSize: 13, color: "#9ca3af", margin: "4px 0 0" },
  card: {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    padding: "16px 20px",
    marginBottom: 16,
    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
  },
  cardLabel: {
    fontSize: 12,
    fontWeight: 600,
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    marginBottom: 10,
  },
  notice: {
    padding: "12px 16px",
    borderRadius: 8,
    background: "#f3f4f6",
    color: "#6b7280",
    fontSize: 14,
    marginBottom: 12,
  },
  table: { width: "100%", borderCollapse: "collapse" },
  theadRow: { borderBottom: "2px solid #f3f4f6" },
  th: {
    padding: "8px 12px",
    fontSize: 12,
    fontWeight: 600,
    color: "#9ca3af",
    textAlign: "left",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  tr: { borderBottom: "1px solid #f9fafb" },
  td: { padding: "12px", fontSize: 14, color: "#111827" },
  fieldRow: { display: "flex", gap: 8, alignItems: "flex-start", flexWrap: "wrap" },
  field: { display: "flex", flexDirection: "column", flex: 1, minWidth: 140 },
  input: {
    padding: "8px 12px",
    border: "1px solid #d1d5db",
    borderRadius: 8,
    fontSize: 14,
    outline: "none",
    color: "#111827",
  },
  error: { fontSize: 11, color: "#ef4444", marginTop: 3 },
  btnPrimary: {
    padding: "8px 16px",
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 500,
    whiteSpace: "nowrap",
  },
  btnGhost: {
    padding: "6px 12px",
    background: "transparent",
    color: "#374151",
    border: "1px solid #e5e7eb",
    borderRadius: 6,
    cursor: "pointer",
    fontSize: 13,
    marginRight: 6,
  },
  btnDanger: {
    padding: "6px 12px",
    background: "transparent",
    color: "#dc2626",
    border: "1px solid #fecaca",
    borderRadius: 6,
    cursor: "pointer",
    fontSize: 13,
  },
};
