"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type MedicalUser = {
  id: string;
  email: string;
  role: "medical_team";
  status: "pending" | "approved" | "rejected";
  created_at: string;
};

export default function AdminPage() {
  const router = useRouter();

  const [users, setUsers] = useState<MedicalUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(
    null
  );
  const [isLoggingOut, setIsLoggingOut] =
    useState(false);
  const [error, setError] = useState<string | null>(
    null
  );

  async function loadUsers() {
    try {
      setError(null);
      setIsLoading(true);

      const response = await fetch(
        "/api/admin/medical-users",
        {
          method: "GET",
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error("ADMIN API ERROR", {
          status: response.status,
          statusText: response.statusText,
          data,
        });

        throw new Error(
          data?.error ||
            `Backend request failed (${response.status})`
        );
      }

      setUsers(data?.users ?? []);
    } catch (error) {
      console.error(
        "Admin medical users error:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to load medical team users"
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  async function handleLogout() {
    if (isLoggingOut) {
      return;
    }

    setIsLoggingOut(true);

    try {
      const response = await fetch(
        "/api/auth/logout",
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        console.error(
          "Logout failed:",
          response.status
        );
      }
    } catch (error) {
      console.error(
        "Logout error:",
        error
      );
    } finally {
      router.push("/login");
      router.refresh();
    }
  }

  async function handleAction(
    userId: string,
    action: "approve" | "reject"
  ) {
    if (actionId) {
      return;
    }

    setActionId(userId);
    setError(null);

    try {
      const response = await fetch(
        `/api/admin/medical-users/${encodeURIComponent(
          userId
        )}/${action}`,
        {
          method: "POST",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            `Failed to ${action} user`
        );
      }

      await loadUsers();
    } catch (error) {
      console.error(
        `Admin ${action} error:`,
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : `Failed to ${action} user`
      );
    } finally {
      setActionId(null);
    }
  }

  const pendingUsers = useMemo(
    () =>
      users.filter(
        (user) => user.status === "pending"
      ),
    [users]
  );

  const approvedUsers = useMemo(
    () =>
      users.filter(
        (user) => user.status === "approved"
      ),
    [users]
  );

  const rejectedUsers = useMemo(
    () =>
      users.filter(
        (user) => user.status === "rejected"
      ),
    [users]
  );

  function formatDate(value: string) {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "Unknown date";
    }

    return new Intl.DateTimeFormat(
      "en-GB",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    ).format(date);
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-5xl px-5 py-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                PTalk
              </p>

              <h1 className="mt-1 text-2xl font-bold text-slate-900">
                Admin
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Manage medical team access
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-800 text-sm font-semibold text-white">
                A
              </div>

              <button
                type="button"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoggingOut
                  ? "Signing out..."
                  : "Logout"}
              </button>
            </div>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-5 py-8">
        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-10 text-center shadow-sm">
            <p className="text-sm text-slate-500">
              Loading medical team users...
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            <section>
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    Pending approval
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Medical team accounts waiting for
                    approval.
                  </p>
                </div>

                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                  {pendingUsers.length}
                </span>
              </div>

              {pendingUsers.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-white px-6 py-8 shadow-sm">
                  <p className="text-sm text-slate-500">
                    No medical team accounts are waiting
                    for approval.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingUsers.map((user) => (
                    <div
                      key={user.id}
                      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                    >
                      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="font-semibold text-slate-900">
                            {user.email}
                          </p>

                          <p className="mt-1 text-sm text-slate-500">
                            Registered{" "}
                            {formatDate(
                              user.created_at
                            )}
                          </p>

                          <span className="mt-3 inline-flex rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700">
                            Pending
                          </span>
                        </div>

                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              handleAction(
                                user.id,
                                "approve"
                              )
                            }
                            disabled={
                              actionId !== null
                            }
                            className="rounded-xl bg-slate-800 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {actionId === user.id
                              ? "Processing..."
                              : "Approve"}
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleAction(
                                user.id,
                                "reject"
                              )
                            }
                            disabled={
                              actionId !== null
                            }
                            className="rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section>
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    Approved
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Medical team members with access to
                    PTalk.
                  </p>
                </div>

                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                  {approvedUsers.length}
                </span>
              </div>

              {approvedUsers.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-white px-6 py-8 shadow-sm">
                  <p className="text-sm text-slate-500">
                    No approved medical team members.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {approvedUsers.map((user) => (
                    <div
                      key={user.id}
                      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="font-semibold text-slate-900">
                            {user.email}
                          </p>

                          <p className="mt-1 text-sm text-slate-500">
                            Registered{" "}
                            {formatDate(
                              user.created_at
                            )}
                          </p>
                        </div>

                        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">
                          Approved
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section>
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    Rejected
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Medical team accounts that were
                    rejected.
                  </p>
                </div>

                <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                  {rejectedUsers.length}
                </span>
              </div>

              {rejectedUsers.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-white px-6 py-8 shadow-sm">
                  <p className="text-sm text-slate-500">
                    No rejected accounts.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {rejectedUsers.map((user) => (
                    <div
                      key={user.id}
                      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="font-semibold text-slate-900">
                            {user.email}
                          </p>

                          <p className="mt-1 text-sm text-slate-500">
                            Registered{" "}
                            {formatDate(
                              user.created_at
                            )}
                          </p>
                        </div>

                        <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700">
                          Rejected
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </section>
    </main>
  );
}