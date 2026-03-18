"use client";

import { useState } from "react";
import { supabase } from "../../../lib/supabase";
import ProtectedPage from "../../components/protected-page";

export default function AccountPage() {
  const [loading, setLoading] = useState(false);

  const handleTestRequest = async () => {
    setLoading(true);

    try {
      const {
        data: { session }
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        alert("Nicht eingeloggt");
        setLoading(false);
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

      alert(`Status: ${res.status}\nAntwort: ${JSON.stringify(data)}`);
    } catch (error) {
      console.error(error);
      alert("Request Fehler");
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
              Jetzt testen wir nur den Request zur Edge Function.
            </p>

            <button
              type="button"
              onClick={handleTestRequest}
              disabled={loading}
              className="mt-4 w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white disabled:opacity-50"
            >
              {loading ? "Teste..." : "Function testen"}
            </button>
          </div>
        </div>
      </div>
    </ProtectedPage>
  );
}