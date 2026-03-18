"use client";

import ProtectedPage from "../../components/protected-page";

export default function AccountPage() {
  const handleTestClick = () => {
    alert("TEST BUTTON FUNKTIONIERT");
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
              Teste jetzt nur, ob der Button überhaupt funktioniert.
            </p>

            <button
              type="button"
              onClick={handleTestClick}
              className="mt-4 w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white"
            >
              Test Button
            </button>
          </div>
        </div>
      </div>
    </ProtectedPage>
  );
}