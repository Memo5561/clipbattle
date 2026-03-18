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

      const {data} = await supabase
        .from("friend_requests")
        .select("status, sender_id, receiver_id")
        .or(
          `and(sender_id.eq.${user.id},receiver_id.eq.${targetUserId}),and(sender_id.eq.${targetUserId},receiver_id.eq.${user.id})`
        )
        .maybeSingle();

      if (data) {
        if (data.status === "accepted") {
          setState("friends");
        } else {
          setState("pending");
        }
      }

      setLoading(false);
    };

    load();
  }, [targetUserId]);

  const sendRequest = async () => {
    if (!currentUserId || sending) return;

    setSending(true);

    const {error} = await supabase.from("friend_requests").insert({
      sender_id: currentUserId,
      receiver_id: targetUserId,
      status: "pending"
    });

    if (error) {
      alert(error.message);
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
      <span className="inline-flex items-center gap-1 rounded-lg border border-emerald-500/30 bg-emerald-500/15 px-3 py-1.5 text-xs font-medium text-emerald-300">
        <Check size={14} />
        Freunde
      </span>
    );
  }

  if (state === "pending") {
    return (
      <span className="inline-flex items-center gap-1 rounded-lg border border-yellow-500/30 bg-yellow-500/15 px-3 py-1.5 text-xs font-medium text-yellow-300">
        <Check size={14} />
        Gesendet
      </span>
    );
  }

  return (
    <button
      onClick={sendRequest}
      disabled={sending}
      className="inline-flex items-center gap-1 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 px-3 py-1.5 text-xs font-semibold text-white shadow-md transition hover:scale-[1.03] disabled:opacity-60"
    >
      {sending ? (
        <Loader2 size={14} className="animate-spin" />
      ) : (
        <UserPlus size={14} />
      )}
      Add
    </button>
  );
}