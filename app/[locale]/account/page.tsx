"use client";

import ProtectedPage from "../../components/protected-page";

export default function AccountPage() {
  const handleClick = async () => {
    alert("BUTTON GEKLICKT");

    try {
      const res = await fetch(
        "https://vdzsxmfrkdjcewwtgefv.supabase.co/functions/v1/delete-account",
        {
          method: "OPTIONS"
        }
      );

      alert(`REQUEST RAUS. STATUS: ${res.status}`);
    } catch (error) {
      alert("FETCH FEHLER");
      console.error(error);
    }
  };

  return (
    <ProtectedPage>
      <div className="min-h-screen bg-black px-4 py-10 text-white">
        <div className="mx-auto max-w-md space-y-6">
          <div className="rounded-2xl bg-zinc-900 p-5">
            <h1 className="text-3xl font-bold">Account Test</h1>

            <button
              type="button"
              onClick={handleClick}
              className="mt-4 w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white"
            >
              Function Direkt Testen
            </button>
          </div>
        </div>
      </div>
    </ProtectedPage>
  );
}