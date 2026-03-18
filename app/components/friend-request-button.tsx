"use client";

import {useEffect, useState} from "react";
import {supabase} from "../../lib/supabase";
import {UserPlus, Check, Loader2} from "lucide-react";

type Props = {
  targetUserId: string;
};

type RequestState = "idle" | "pending" | "friends";

export default function FriendRequestButton({targetUserId}: Props) {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [state, setState] = useState<RequestState>("idle");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);

      const {
        data: {user}
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      setCurrentUserId(user.id);

      if (user.id === targetUserId) {
        setLoading(false);
        return;
      }

      const {data, error} = await supabase
        .from("friend_requests")
        .select("status, sender_id, receiver_id")
        .or(
          `and(sender_id.eq.${user.id},receiver_id.eq.${targetUserId}),and(sender_id.eq.${targetUserId},receiver_id.eq.${user.id})`
        )
        .maybeSingle();

      if (!error && data) {
        if (data.status === "accepted") {
          setState("friends");
        } else if (data.status === "pending") {
          setState("pending");
        }
      }

      setLoading(false);
    };

    load();
  }, [targetUserId]);

  const handleSendRequest = async () => {
    if (!currentUserId || currentUserId === targetUserId || sending) return;

    setSending(true);

    const {error} = await supabase.from("friend_requests").insert({
      sender_id: currentUserId,
      receiver_id: targetUserId,
      status: "pending"
    });

    if (error) {
      alert("Fehler beim Senden: " + error.message);
      setSending(false);
      return;
    }

    setState("pending");
    setSending(false);
  };

  if (loading || !currentUserId || currentUserId === targetUserId) {
    return null;
  }

  if (state === "friends") {
    return (
      <button
        disabled
        className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/15 px-4 py-2 text-sm font-medium text-emerald-300"
      >
        <Check size={16} />
        Freunde
      </button>
    );
  }

  if (state === "pending") {
    return (
      <button
        disabled
        className="inline-flex items-center gap-2 rounded-xl border border-yellow-500/30 bg-yellow-500/15 px-4 py-2 text-sm font-medium text-yellow-300"
      >
        <Check size={16} />
        Anfrage gesendet
      </button>
    );
  }

  return (
    <button
      onClick={handleSendRequest}
      disabled={sending}
      className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:scale-[1.02] disabled:opacity-60"
    >
      {sending ? (
        <Loader2 size={16} className="animate-spin" />
      ) : (
        <UserPlus size={16} />
      )}
      Freund hinzufügen
    </button>
  );
}