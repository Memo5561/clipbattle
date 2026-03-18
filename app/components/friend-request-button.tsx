"use client";

import {useEffect, useState} from "react";
import {supabase} from "../../lib/supabase";
import {UserPlus, Check, Loader2} from "lucide-react";

type Props = {
  targetUserId: string;
};

type State = "idle" | "pending" | "friends";

export default function FriendRequestButton({targetUserId}: Props) {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [state, setState] = useState<State>("idle");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const load = async () => {
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
      receiver_id: targetUserId
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
      <button className="rounded-xl bg-emerald-500/20 px-4 py-2 text-sm text-emerald-300">
        <Check size={16} /> Freunde
      </button>
    );
  }

  if (state === "pending") {
    return (
      <button className="rounded-xl bg-yellow-500/20 px-4 py-2 text-sm text-yellow-300">
        Anfrage gesendet
      </button>
    );
  }

  return (
    <button
      onClick={sendRequest}
      disabled={sending}
      className="flex items-center gap-2 rounded-xl bg-blue-500 px-4 py-2 text-sm text-white"
    >
      {sending ? <Loader2 size={16} /> : <UserPlus size={16} />}
      Freund hinzufügen
    </button>
  );
}