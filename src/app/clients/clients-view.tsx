"use client";

import { useState, type FormEvent, type ReactNode } from "react";

import { api, type RouterOutputs } from "~/trpc/react";

type ClientRow = RouterOutputs["clients"]["list"][number];

type FormState = {
  name: string;
  email: string;
  phone: string;
  address: string;
  notes: string;
};

const EMPTY_FORM: FormState = {
  name: "",
  email: "",
  phone: "",
  address: "",
  notes: "",
};

type FieldErrors = Record<string, string[] | undefined>;

function getFieldErrors(error: unknown): FieldErrors {
  const data = (
    error as { data?: { zodError?: { fieldErrors?: FieldErrors } } } | null
  )?.data;
  return data?.zodError?.fieldErrors ?? {};
}

const inputClass =
  "w-full rounded-lg border border-border bg-primary px-3 py-2 text-sm text-text outline-none transition placeholder:text-text/40 focus:border-border-foreground";

const primaryButton =
  "rounded-lg bg-text px-4 py-2 text-sm font-medium text-background transition hover:opacity-90 disabled:opacity-50";

const secondaryButton =
  "rounded-lg border border-border bg-primary px-4 py-2 text-sm text-text transition hover:bg-hover";

const dangerButton =
  "rounded-lg border border-red-500/40 px-3 py-1.5 text-sm text-red-300 transition hover:bg-red-500/10";

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-text/50 text-xs tracking-wide uppercase">
        {label}
      </span>
      {children}
      {error && <span className="text-xs text-red-300">{error}</span>}
    </label>
  );
}

export function ClientsView() {
  const utils = api.useUtils();
  const [search, setSearch] = useState("");
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const trimmedSearch = search.trim();

  const list = api.clients.list.useQuery({
    search: trimmedSearch === "" ? undefined : trimmedSearch,
    take: 100,
    skip: 0,
  });

  const closeForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setOpen(false);
  };

  const createClient = api.clients.create.useMutation({
    onSuccess: async () => {
      closeForm();
      await utils.clients.list.invalidate();
    },
  });

  const updateClient = api.clients.update.useMutation({
    onSuccess: async () => {
      closeForm();
      await utils.clients.list.invalidate();
    },
  });

  const deleteClient = api.clients.delete.useMutation({
    onSuccess: async () => {
      await utils.clients.list.invalidate();
    },
  });

  const saving = createClient.isPending || updateClient.isPending;
  const error = createClient.error ?? updateClient.error;
  const fieldErrors = getFieldErrors(error);

  const startEdit = (client: ClientRow) => {
    setEditingId(client.id);
    setForm({
      name: client.name,
      email: client.email ?? "",
      phone: client.phone ?? "",
      address: client.address ?? "",
      notes: client.notes ?? "",
    });
    setOpen(true);
    createClient.reset();
    updateClient.reset();
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();

    if (editingId) {
      updateClient.mutate({ id: editingId, ...form });
    } else {
      createClient.mutate(form);
    }
  };

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4 p-4">
      <header className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Clients</h1>
        <button
          type="button"
          className={open ? secondaryButton : primaryButton}
          onClick={() => {
            if (open) {
              closeForm();
            } else {
              createClient.reset();
              updateClient.reset();
              setOpen(true);
            }
          }}
        >
          {open ? "Cancel" : "New client"}
        </button>
      </header>

      <input
        className={inputClass}
        value={search}
        placeholder="Search clients by name or email"
        onChange={(event) => setSearch(event.target.value)}
      />

      {open && (
        <form
          onSubmit={submit}
          className="border-border bg-foreground flex flex-col gap-3 rounded-lg border p-4"
        >
          <h2 className="font-semibold">
            {editingId ? "Edit client" : "New client"}
          </h2>

          {error && (
            <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
              {Object.keys(fieldErrors).length > 0
                ? "Please fix the highlighted fields."
                : error.message}
            </p>
          )}

          <Field label="Name" error={fieldErrors.name?.[0]}>
            <input
              className={inputClass}
              value={form.name}
              onChange={(event) =>
                setForm({ ...form, name: event.target.value })
              }
            />
          </Field>

          <Field label="Email" error={fieldErrors.email?.[0]}>
            <input
              className={inputClass}
              value={form.email}
              onChange={(event) =>
                setForm({ ...form, email: event.target.value })
              }
            />
          </Field>

          <Field label="Phone" error={fieldErrors.phone?.[0]}>
            <input
              className={inputClass}
              value={form.phone}
              onChange={(event) =>
                setForm({ ...form, phone: event.target.value })
              }
            />
          </Field>

          <Field label="Address" error={fieldErrors.address?.[0]}>
            <input
              className={inputClass}
              value={form.address}
              onChange={(event) =>
                setForm({ ...form, address: event.target.value })
              }
            />
          </Field>

          <Field label="Notes" error={fieldErrors.notes?.[0]}>
            <textarea
              className={`${inputClass} min-h-20 resize-y`}
              value={form.notes}
              onChange={(event) =>
                setForm({ ...form, notes: event.target.value })
              }
            />
          </Field>

          <div className="flex gap-2">
            <button type="submit" className={primaryButton} disabled={saving}>
              {saving
                ? "Saving..."
                : editingId
                  ? "Save changes"
                  : "Create client"}
            </button>
            <button
              type="button"
              className={secondaryButton}
              onClick={closeForm}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {list.isPending ? (
        <p className="text-text/50 text-sm">Loading...</p>
      ) : list.error ? (
        <p className="text-sm text-red-300">{list.error.message}</p>
      ) : list.data.length === 0 ? (
        <p className="text-text/50 text-sm">
          {trimmedSearch === ""
            ? "No clients yet."
            : "No clients match that search."}
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {list.data.map((client) => (
            <li
              key={client.id}
              className="border-border bg-foreground flex items-start justify-between gap-4 rounded-lg border p-4"
            >
              <div className="flex min-w-0 flex-col gap-1">
                <p className="truncate font-semibold">{client.name}</p>
                <p className="text-text/60 truncate text-sm">
                  {client.email ?? "No email"}
                  {client.phone ? ` · ${client.phone}` : ""}
                </p>
                {client.address && (
                  <p className="text-text/40 truncate text-sm">
                    {client.address}
                  </p>
                )}
                {client.notes && (
                  <p className="text-text/50 mt-1 text-sm whitespace-pre-wrap">
                    {client.notes}
                  </p>
                )}
              </div>

              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  className={secondaryButton}
                  onClick={() => startEdit(client)}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className={dangerButton}
                  disabled={deleteClient.isPending}
                  onClick={() => {
                    if (window.confirm(`Delete ${client.name}?`)) {
                      deleteClient.mutate({ id: client.id });
                    }
                  }}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
