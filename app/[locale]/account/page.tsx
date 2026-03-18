"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";
import ProtectedPage from "../../components/protected-page";

export default function AccountPage() {
  const [username, setUsername] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingDelete, setLoadingDelete] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      const {
        data: { user }
      } = await supabase.auth.getUser();

      setUsername(user?.user_metadata?.username ?? null);
      setEmail(user?.email ?? null);
      setLoading(false);
    };

    loadUser();
  }, []);

  const handleDeleteAccount = async () => {
    const confirmDelete = window.confirm(
      "Willst du dein Konto wirklich löschen? Das kann nicht rückgängig gemacht werden!"
    );

    if (!confirmDelete) return;

    setLoadingDelete(true);

    try {
      const {
        data: { session }
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        alert("Nicht eingeloggt");
        setLoadingDelete(false);
        return;
      }

      const res = await fetch(
        "https://vdzsxmfrkdjcewwtgefv.supabase.co/functions/v1/delete-account",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`
          }
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert("Fehler: " + (data?.error || "Unbekannt"));
        setLoadingDelete(false);
        return;
      }

      alert("Account erfolgreich gelöscht");

      await supabase.auth.signOut();
      window.location.href = "/";
    } catch (error) {
      console.error("Delete account error:", error);
      alert("Fehler beim Löschen");
      setLoadingDelete(false);
    }
  };

  return (
    <ProtectedPage>
      <div className="min-h-screen bg-black px-4 py-10 text-white">
        <div className="mx-auto max-w-md space-y-6">
          <div className="rounded-2xl bg-zinc-900 p-5 shadow-xl">
            <p className="text-sm text-zinc-400">Account</p>
            <h1 className="text-3xl font-bold">Kontoinformationen</h1>
          </div>

          {loading ? (
            <div className="rounded-2xl bg-zinc-900 p-5">
              <p className="text-zinc-400">Lädt...</p>
            </div>
          ) : (
            <>
              <div className="rounded-2xl bg-zinc-900 p-5">
                <p className="text-sm text-zinc-400">Username</p>
                <p className="text-lg font-semibold">{username ?? "—"}</p>
              </div>

              <div className="rounded-2xl bg-zinc-900 p-5">
                <p className="text-sm text-zinc-400">E-Mail</p>
                <p className="text-lg font-semibold break-all">{email ?? "—"}</p>
              </div>

              <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-5">
                <h2 className="mb-2 font-semibold text-red-400">
                  Konto löschen
                </h2>
                <p className="mb-4 text-sm text-red-300">
                  Dein Konto und alle Daten werden dauerhaft gelöscht.
                </p>

                <button
                  type="button"
                  onClick={handleDeleteAccount}
                  disabled={loadingDelete}
                  className="w-full rounded-xl bg-gradient-to-r from-red-500 to-orange-500 px-4 py-3 font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
                >
                  {loadingDelete ? "Wird gelöscht..." : "Konto löschen"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </ProtectedPage>
  );
}