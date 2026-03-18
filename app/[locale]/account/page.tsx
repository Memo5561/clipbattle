"use client";

import {useEffect, useState} from "react";
import {supabase} from "../../../lib/supabase";
import ProtectedPage from "../../components/protected-page";
import {User, Mail, Calendar, Shield} from "lucide-react";

type AccountData = {
  id: string;
  email: string | null;
  username: string | null;
  created_at: string | null;
};

export default function AccountPage() {
  const [loading, setLoading] = useState(true);
  const [account, setAccount] = useState<AccountData | null>(null);

  useEffect(() => {
    const loadAccount = async () => {
      setLoading(true);

      const {
        data: {user}
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      let username: string | null = null;

      const {data: profile} = await supabase
        .from("profiles")
        .select("username")
        .eq("id", user.id)
        .maybeSingle();

      if (profile) {
        username = profile.username ?? null;
      }

      setAccount({
        id: user.id,
        email: user.email ?? null,
        username,
        created_at: user.created_at ?? null
      });

      setLoading(false);
    };

    loadAccount();
  }, []);

  const formatDate = (value: string | null) => {
    if (!value) return "Unbekannt";
    return new Date(value).toLocaleDateString("de-DE", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  return (
    <ProtectedPage>
      <div className="mx-auto max-w-4xl space-y-4 text-white">
        <section className="rounded-3xl border border-zinc-800 bg-zinc-900/80 p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-blue-500/15 p-3 text-blue-300">
              <User size={22} />
            </div>

            <div>
              <p className="text-sm text-zinc-400">Account</p>
              <h1 className="text-2xl font-bold">Kontoinformationen</h1>
            </div>
          </div>
        </section>

        {loading ? (
          <section className="rounded-3xl border border-zinc-800 bg-zinc-900/80 p-6 text-zinc-400">
            Lädt...
          </section>
        ) : !account ? (
          <section className="rounded-3xl border border-zinc-800 bg-zinc-900/80 p-6">
            <h2 className="text-xl font-semibold">Nicht eingeloggt</h2>
            <p className="mt-2 text-zinc-400">
              Du musst eingeloggt sein, um deine Kontoinformationen zu sehen.
            </p>
          </section>
        ) : (
          <>
            <section className="rounded-3xl border border-zinc-800 bg-zinc-900/80 p-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                  <div className="mb-2 flex items-center gap-2 text-zinc-400">
                    <User size={16} />
                    <span className="text-sm">Username</span>
                  </div>
                  <p className="text-lg font-semibold text-white">
                    {account.username || "Nicht gesetzt"}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                  <div className="mb-2 flex items-center gap-2 text-zinc-400">
                    <Mail size={16} />
                    <span className="text-sm">E-Mail</span>
                  </div>
                  <p className="text-lg font-semibold text-white break-all">
                    {account.email || "Nicht verfügbar"}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                  <div className="mb-2 flex items-center gap-2 text-zinc-400">
                    <Calendar size={16} />
                    <span className="text-sm">Konto erstellt</span>
                  </div>
                  <p className="text-lg font-semibold text-white">
                    {formatDate(account.created_at)}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                  <div className="mb-2 flex items-center gap-2 text-zinc-400">
                    <Shield size={16} />
                    <span className="text-sm">User ID</span>
                  </div>
                  <p className="text-sm font-medium text-white break-all">
                    {account.id}
                  </p>
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </ProtectedPage>
  );
}
