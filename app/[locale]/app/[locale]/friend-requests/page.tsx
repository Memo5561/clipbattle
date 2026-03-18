"use client";

import {useEffect, useState} from "react";
import {supabase} from "../../../lib/supabase";
import ProtectedPage from "../../components/protected-page";
import {Check, X, Users} from "lucide-react";

type FriendRequest = {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: "pending" | "accepted" | "rejected";
  created_at: string;
};

type ProfileMap = Record<
  string,
  {
    username: string | null;
  }
>;

export default function FriendRequestsPage() {
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [profiles, setProfiles] = useState<ProfileMap>({});
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    setLoading(true);

    const {
      data: {user}
    } = await supabase.auth.getUser();

    if (!user) {
      setCurrentUserId(null);
      setLoading(false);
      return;
    }

    setCurrentUserId(user.id);

    const {data, error} = await supabase
      .from("friend_requests")
      .select("*")
      .eq("receiver_id", user.id)
      .eq("status", "pending")
      .order("created_at", {ascending: false});

    if (error) {
      console.error("Fehler beim Laden der Anfragen:", error.message);
      setLoading(false);
      return;
    }

    const loadedRequests = (data as FriendRequest[]) || [];
    setRequests(loadedRequests);

    const senderIds = [...new Set(loadedRequests.map((item) => item.sender_id))];

    if (senderIds.length > 0) {
      const {data: clipsData, error: clipsError} = await supabase
        .from("clips")
        .select("user_id, username")
        .in("user_id", senderIds);

      if (!clipsError && clipsData) {
        const nextProfiles: ProfileMap = {};

        for (const row of clipsData) {
          const userId = row.user_id as string;
          if (!nextProfiles[userId]) {
            nextProfiles[userId] = {
              username: (row.username as string | null) ?? null
            };
          }
        }

        setProfiles(nextProfiles);
      }
    }

    setLoading(false);
  };

  const handleAccept = async (requestId: string) => {
    if (!currentUserId || processingId) return;

    setProcessingId(requestId);

    const {error} = await supabase
      .from("friend_requests")
      .update({status: "accepted"})
      .eq("id", requestId)
      .eq("receiver_id", currentUserId);

    if (error) {
      alert("Fehler beim Annehmen: " + error.message);
      setProcessingId(null);
      return;
    }

    setRequests((prev) => prev.filter((item) => item.id !== requestId));
    setProcessingId(null);
  };

  const handleReject = async (requestId: string) => {
    if (!currentUserId || processingId) return;

    setProcessingId(requestId);

    const {error} = await supabase
      .from("friend_requests")
      .update({status: "rejected"})
      .eq("id", requestId)
      .eq("receiver_id", currentUserId);

    if (error) {
      alert("Fehler beim Ablehnen: " + error.message);
      setProcessingId(null);
      return;
    }

    setRequests((prev) => prev.filter((item) => item.id !== requestId));
    setProcessingId(null);
  };

  return (
    <ProtectedPage>
      <div className="mx-auto max-w-4xl space-y-4 text-white">
        <section className="rounded-3xl border border-zinc-800 bg-zinc-900/80 p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-blue-500/15 p-3 text-blue-300">
              <Users size={22} />
            </div>

            <div>
              <p className="text-sm text-zinc-400">Social</p>
              <h1 className="text-2xl font-bold">Freundschaftsanfragen</h1>
            </div>
          </div>
        </section>

        {loading ? (
          <section className="rounded-3xl border border-zinc-800 bg-zinc-900/80 p-6 text-zinc-400">
            Lädt...
          </section>
        ) : !currentUserId ? (
          <section className="rounded-3xl border border-zinc-800 bg-zinc-900/80 p-6">
            <h2 className="text-xl font-semibold">Nicht eingeloggt</h2>
            <p className="mt-2 text-zinc-400">
              Du musst eingeloggt sein, um Freundschaftsanfragen zu sehen.
            </p>
          </section>
        ) : requests.length === 0 ? (
          <section className="rounded-3xl border border-zinc-800 bg-zinc-900/80 p-6">
            <h2 className="text-xl font-semibold">Keine offenen Anfragen</h2>
            <p className="mt-2 text-zinc-400">
              Aktuell hat dir niemand eine Freundschaftsanfrage geschickt.
            </p>
          </section>
        ) : (
          requests.map((request) => {
            const senderProfile = profiles[request.sender_id];
            const senderName = senderProfile?.username || "Unbekannt";

            return (
              <section
                key={request.id}
                className="rounded-3xl border border-zinc-800 bg-zinc-900/80 p-5"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-zinc-400">Anfrage von</p>
                    <h2 className="text-xl font-bold text-white">{senderName}</h2>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => handleAccept(request.id)}
                      disabled={processingId === request.id}
                      className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500 px-4 py-2 font-semibold text-white transition hover:scale-[1.02] disabled:opacity-60"
                    >
                      <Check size={18} />
                      Annehmen
                    </button>

                    <button
                      type="button"
                      onClick={() => handleReject(request.id)}
                      disabled={processingId === request.id}
                      className="inline-flex items-center gap-2 rounded-2xl bg-red-500 px-4 py-2 font-semibold text-white transition hover:scale-[1.02] disabled:opacity-60"
                    >
                      <X size={18} />
                      Ablehnen
                    </button>
                  </div>
                </div>
              </section>
            );
          })
        )}
      </div>
    </ProtectedPage>
  );
}