"use client";

import {useEffect, useState} from "react";
import {useTranslations} from "next-intl";
import {supabase} from "../../../lib/supabase";
import ProtectedPage from "../../components/protected-page";

export default function AccountPage() {
  const t = useTranslations("Account");

  const [username, setUsername] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingDelete, setLoadingDelete] = useState(false);

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
    const confirmed = window.confirm(t("confirmDelete"));

    if (!confirmed) return;

    setLoadingDelete(true);

    try {
      const {
        data: {session}
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        alert(t("notLoggedIn"));
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

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        alert(`${t("deleteError")}: ${data?.error || "Unknown error"}`);
        setLoadingDelete(false);
        return;
      }

      alert(t("deleteSuccess"));

      await supabase.auth.signOut();
      window.location.href = "/";
    } catch (error) {
      console.error(error);
      alert(t("deleteError"));
      setLoadingDelete(false);
    }
  };

  return (
    <ProtectedPage>
      <div className="min-h-screen bg-black px-4 py-10 text-white">
        <div className="mx-auto max-w-md space-y-6">
          <div className="rounded-2xl bg-zinc-900 p-5 shadow-xl">
            <p className="text-sm text-zinc-400">{t("section")}</p>
            <h1 className="text-3xl font-bold">{t("title")}</h1>
          </div>

          {loading ? (
            <div className="rounded-2xl bg-zinc-900 p-5">
              <p className="text-zinc-400">{t("loading")}</p>
            </div>
          ) : (
            <>
              <div className="rounded-2xl bg-zinc-900 p-5">
                <p className="text-sm text-zinc-400">{t("username")}</p>
                <p className="text-lg font-semibold">{username ?? "—"}</p>
              </div>

              <div className="rounded-2xl bg-zinc-900 p-5">
                <p className="text-sm text-zinc-400">{t("email")}</p>
                <p className="break-all text-lg font-semibold">{email ?? "—"}</p>
              </div>

              <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-5">
                <h2 className="mb-2 font-semibold text-red-400">
                  {t("deleteTitle")}
                </h2>
                <p className="mb-4 text-sm text-red-300">
                  {t("deleteText")}
                </p>

                <button
                  type="button"
                  onClick={handleDeleteAccount}
                  disabled={loadingDelete}
                  className="w-full rounded-xl bg-gradient-to-r from-red-500 to-orange-500 px-4 py-3 font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
                >
                  {loadingDelete ? t("deleting") : t("deleteButton")}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </ProtectedPage>
  );
}