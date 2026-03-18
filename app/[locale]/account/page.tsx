"use client";

import {useEffect, useState} from "react";
import {supabase} from "../../../lib/supabase";
import ProtectedPage from "../../components/protected-page";

export default function AccountPage() {
  const [username, setUsername] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      const {
        data: {user}
      } = await supabase.auth.getUser();

      setUsername(user?.user_metadata?.username ?? null);
      setEmail(user?.email ?? null);
      setLoading(false);
    };

    loadUser();
  }, []);

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      "Willst du dein Konto wirklich dauerhaft löschen? Dieser Schritt kann nicht rückgängig gemacht werden."
    );

    if (!confirmed) return;

    setDeleting(true);

    const {
      data: {session}
    } = await supabase.auth.getSession();

    if (!session?.access_token) {
      alert("Nicht eingeloggt");
      setDeleting(false);
      return;
    }

    const response = await fetch(
      "https://vdzsxmfrkdjcewwtgefv.supabase.co/functions/v1/delete-account",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`
        }
      }
    );

    const result = await response.json();

    if (!response.ok) {
      alert("Fehler beim Löschen: " + (result.error || "Unbekannt"));
      setDeleting(false);
      return;
    }

    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <ProtectedPage>
      <div className="mx-auto max-w-2xl space-y-6 p-6 text-white">
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/80 p-6">
          <p className="text-sm text-zinc-400">Account</p>
          <h1 className="text-3xl font-bold">Kontoinformationen</h1>
        </div>

        {loading ? (
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900/80 p-6 text-zinc-400">
            Lädt...
          </div>
        ) : (
          <>
            <div className="rounded-3xl border border-zinc-800 bg-zinc-900/80 p-6">
              <p className="text-sm text-zinc-400">Username</p>
              <p className="mt-1 text-lg font-semibold text-white">
                {username || "Nicht gesetzt"}
              </p>
            </div>

            <div className="rounded-3xl border border-zinc-800 bg-zinc-900/80 p-6">
              <p className="text-sm text-zinc-400">E-Mail</p>
              <p className="mt-1 break-all text-lg font-semibold text-white">
                {email || "Nicht verfügbar"}
              </p>
            </div>

            <div className="rounded-3xl border border-red-500/30 bg-red-500/10 p-6">
              <h2 className="text-xl font-bold text-red-400">
                Konto löschen
              </h2>

              <p className="mt-2 text-sm text-zinc-300">
                Dein Konto und alle dazugehörigen Daten werden dauerhaft gelöscht.
              </p>

              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="mt-4 w-full rounded-2xl bg-red-600 px-6 py-3 font-semibold text-white transition hover:bg-red-500 disabled:opacity-60"
              >
                {deleting ? "Wird gelöscht..." : "Konto dauerhaft löschen"}
              </button>
            </div>
          </>
        )}
      </div>
    </ProtectedPage>
  );
}