"use client";

import {useEffect, useState} from "react";
import {supabase} from "../../lib/supabase";
import {Loader2, UserCheck, UserPlus} from "lucide-react";

type Props = {
  targetUserId: string;
};

export default function FollowButton({targetUserId}: Props) {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      const {
        data: {user}
      } = await supabase.auth.getUser();

      if (!mounted) return;

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
        .from("follows")
        .select("id")
        .eq("follower_id", user.id)
        .eq("following_id", targetUserId)
        .maybeSingle();

      if (!mounted) return;

      if (error) {
        console.error("Follow load error:", error.message);
      }

      setIsFollowing(!!data);
      setLoading(false);
    };

    load();

    return () => {
      mounted = false;
    };
  }, [targetUserId]);

  const toggleFollow = async () => {
    if (!currentUserId || actionLoading) return;

    setActionLoading(true);

    if (isFollowing) {
      const {error} = await supabase
        .from("follows")
        .delete()
        .eq("follower_id", currentUserId)
        .eq("following_id", targetUserId);

      if (error) {
        alert(error.message);
        setActionLoading(false);
        return;
      }

      setIsFollowing(false);
      setActionLoading(false);
      return;
    }

    const {error} = await supabase.from("follows").insert({
      follower_id: currentUserId,
      following_id: targetUserId
    });

    if (error) {
      alert(error.message);
      setActionLoading(false);
      return;
    }

    setIsFollowing(true);
    setActionLoading(false);
  };

  if (loading || !currentUserId || currentUserId === targetUserId) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={toggleFollow}
      disabled={actionLoading}
      className={`inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
        isFollowing
          ? "border border-zinc-700 bg-zinc-800 text-white hover:bg-zinc-700"
          : "bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:scale-[1.03]"
      } disabled:opacity-60`}
    >
      {actionLoading ? (
        <Loader2 size={14} className="animate-spin" />
      ) : isFollowing ? (
        <>
          <UserCheck size={14} />
          Following
        </>
      ) : (
        <>
          <UserPlus size={14} />
          Follow
        </>
      )}
    </button>
  );
}
