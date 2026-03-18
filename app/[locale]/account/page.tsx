"use client";

import { useState } from "react";
import { supabase } from "../../../lib/supabase";
import ProtectedPage from "../../components/protected-page";

export default function AccountPage() {
  const [loading, setLoading] = useState(false);

  const handleDebug = async () => {
    setLoading(true);

    try {
      const {
        data: { session }
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        alert("Kein access_token gefunden");
        setLoading(false);
        return;
      }

      const token = session.access_token;

      const authRes = await fetch(
        "https://vdzsxmfrkdjcewwtgefv.supabase.co/auth/v1/user",
        {
          method: "GET",
          headers: {
            apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            Authorization: `Bearer ${token}`
          }
        }
      );

      const authData = await authRes.json().catch(() => null);

      alert(
        `AUTH TEST\nStatus: ${authRes.status}\nAntwort: ${JSON.stringify(authData)}`
      );
    } catch (error) {
      console.error(error);
      alert("Debug Fehler");
    } finally {
      setLoading(false);
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

          <div className="rounded-2xl bg-zinc-900 p-5">
            <p className="text-sm text-zinc-400">
              Wir testen jetzt direkt, ob dein aktueller Token bei Supabase gültig ist.
            </p>

            <button
              type="button"
              onClick={handleDebug}
              disabled={loading}
              className="mt-4 w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white disabled:opacity-50"
            >
              {loading ? "Teste..." : "Auth Test"}
            </button>
          </div>
        </div>
      </div>
    </ProtectedPage>
  );
}