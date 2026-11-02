"use client";

import { useState, type FormEvent, type ReactNode } from "react";

import { Plus, Search, X } from "lucide-react";

import {
  dangerButton,
  primaryButton,
  secondaryButton,
} from "~/components/buttonStyles";
import { errorClass, fieldClass, labelClass } from "~/components/fieldStyles";
import { api, type RouterOutputs } from "~/trpc/react";

type ClientRow = RouterOutputs["clients"]["list"][number];

type FormState = {
  name: string;
  contactName: string;
  email: string;
  phone: string;
  address: string;
  notes: string;
};

const EMPTY_FORM: FormState = {
  name: "",
  contactName: "",
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
    <label className="block">
      <span className={labelClass}>{label}</span>
      {children}
      {error && <span className={`block ${errorClass}`}>{error}</span>}
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
      contactName: client.contactName ?? "",
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

  const openNew = () => {
    createClient.reset();
    updateClient.reset();
    setForm(EMPTY_FORM);
    setEditingId(null);
    setOpen(true);
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-end justify-between gap-6">
        <div>
          <h1 className="text-display-page">Clients</h1>
          <p className="mt-2 max-w-[65ch] text-body-l text-fg-secondary">
            Everyone you bill, in one place.
          </p>
        </div>
        <button
          type="button"
          className={`${primaryButton} shrink-0`}
          onClick={openNew}
        >
          <Plus className="size-4" /> New client
        </button>
      </div>

      <div className="grid grid-cols-12 items-start gap-6">
        <div
          className={`overflow-hidden rounded-lg border border-border-default bg-surface shadow-card ${open ? "col-span-8" : "col-span-12"}`}
        >
          <div className="p-6">
            <label className="relative block max-w-xs">
              <span className="sr-only">Search clients</span>
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-fg-tertiary" />
              <input
                className="h-10 w-full rounded-md border border-border-default bg-sunken pr-3 pl-9 text-body-m text-fg-primary placeholder:text-fg-tertiary focus:border-border-accent focus:outline-none"
                value={search}
                placeholder="Search by name or email"
                onChange={(event) => setSearch(event.target.value)}
              />
            </label>
          </div>

          {list.isPending ? (
            <p className="border-t border-border-subtle p-6 text-body-m text-fg-tertiary">
              Loading clients…
            </p>
          ) : list.error ? (
            <p className="border-t border-border-subtle p-6 text-body-m text-status-overdue-fg">
              {list.error.message}
            </p>
          ) : list.data.length === 0 ? (
            <p className="border-t border-border-subtle p-6 text-body-m text-fg-tertiary">
              {trimmedSearch === ""
                ? "No clients yet. Add your first one to start invoicing."
                : "No clients match that search."}
            </p>
          ) : (
            <ul>
              {list.data.map((client) => (
                <li
                  key={client.id}
                  className="flex items-start justify-between gap-4 border-t border-border-subtle px-6 py-4 transition-colors duration-120 ease-out hover:bg-sunken/60"
                >
                  <div className="flex min-w-0 flex-col gap-1">
                    <p className="truncate text-label-m text-fg-primary">
                      {client.name}
                    </p>
                    {client.contactName && (
                      <p className="truncate text-body-s text-fg-secondary">
                        {client.contactName}
                      </p>
                    )}
                    <p className="truncate text-body-s text-fg-secondary">
                      {client.email ?? "No email"}
                      {client.phone ? ` · ${client.phone}` : ""}
                    </p>
                    {client.address && (
                      <p className="truncate text-body-s text-fg-tertiary">
                        {client.address}
                      </p>
                    )}
                    {client.notes && (
                      <p className="mt-1 text-body-s whitespace-pre-wrap text-fg-tertiary">
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

        {open && (
          <form
            noValidate
            onSubmit={submit}
            className="sticky top-8 col-span-4 flex flex-col gap-5 rounded-lg border border-border-default bg-surface p-6 shadow-card"
          >
            <div className="flex items-start justify-between gap-4">
              <h2 className="text-title-section">
                {editingId ? "Edit client" : "New client"}
              </h2>
              <button
                type="button"
                onClick={closeForm}
                aria-label="Close"
                className="rounded-sm p-1 text-fg-tertiary transition-colors duration-120 ease-out hover:bg-sunken hover:text-fg-primary focus-visible:outline-2 focus-visible:outline-border-focus"
              >
                <X className="size-5" />
              </button>
            </div>

            {error && (
              <p
                role="alert"
                className="rounded-lg bg-status-overdue p-4 text-body-m text-status-overdue-fg"
              >
                {Object.keys(fieldErrors).length > 0
                  ? "Please fix the highlighted fields."
                  : error.message}
              </p>
            )}

            <Field label="Name" error={fieldErrors.name?.[0]}>
              <input
                className={fieldClass(!!fieldErrors.name)}
                value={form.name}
                onChange={(event) =>
                  setForm({ ...form, name: event.target.value })
                }
              />
            </Field>

            <Field label="Contact person" error={fieldErrors.contactName?.[0]}>
              <input
                className={fieldClass(!!fieldErrors.contactName)}
                value={form.contactName}
                onChange={(event) =>
                  setForm({ ...form, contactName: event.target.value })
                }
              />
            </Field>

            <Field label="Email" error={fieldErrors.email?.[0]}>
              <input
                className={fieldClass(!!fieldErrors.email)}
                value={form.email}
                onChange={(event) =>
                  setForm({ ...form, email: event.target.value })
                }
              />
            </Field>

            <Field label="Phone" error={fieldErrors.phone?.[0]}>
              <input
                className={fieldClass(!!fieldErrors.phone)}
                value={form.phone}
                onChange={(event) =>
                  setForm({ ...form, phone: event.target.value })
                }
              />
            </Field>

            <Field label="Address" error={fieldErrors.address?.[0]}>
              <input
                className={fieldClass(!!fieldErrors.address)}
                value={form.address}
                onChange={(event) =>
                  setForm({ ...form, address: event.target.value })
                }
              />
            </Field>

            <Field label="Notes" error={fieldErrors.notes?.[0]}>
              <textarea
                className={`${fieldClass(!!fieldErrors.notes)} h-auto min-h-24 resize-y py-3`}
                value={form.notes}
                onChange={(event) =>
                  setForm({ ...form, notes: event.target.value })
                }
              />
            </Field>

            <div className="flex gap-3">
              <button type="submit" className={primaryButton} disabled={saving}>
                {saving
                  ? "Saving…"
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
      </div>
    </div>
  );
}