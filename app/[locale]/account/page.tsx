"use client";

import {useEffect, useMemo, useState} from "react";
import {useTranslations} from "next-intl";
import {Link, useRouter} from "../../../i18n/navigation";
import {supabase} from "../../../lib/supabase";
import ProtectedPage from "../../components/protected-page";
import {
  ChevronRight,
  Film,
  Heart,
  Mail,
  ShieldAlert,
  User,
  Users
} from "lucide-react";

type ClipStat = {
  id: string;
  votes: number;
};

export default function AccountPage() {
  const t = useTranslations("Account");
  const router = useRouter();

  const [userId, setUserId] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  const [clipCount, setClipCount] = useState(0);
  const [totalLikes, setTotalLikes] = useState(0);
  const [followers, setFollowers] = useState(0);
  const [following, setFollowing] = useState(0);

  const [loading, setLoading] = useState(true);
  const [loadingDelete, setLoadingDelete] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadUser = async () => {
      setLoading(true);

      const {
        data: {user}
      } = await supabase.auth.getUser();

      if (!mounted) return;

      if (!user) {
        setLoading(false);
        return;
      }

      setUserId(user.id);
      setUsername(user.user_metadata?.username ?? null);
      setEmail(user.email ?? null);

      const {data: clipsData, error: clipsError} = await supabase
        .from("clips_with_likes")
        .select("id, votes")
        .eq("user_id", user.id);

      if (!mounted) return;

      if (clipsError) {
        console.error("Account clips load error:", clipsError.message);
      } else {
        const safeClips = (clipsData as ClipStat[]) || [];
        setClipCount(safeClips.length);
        setTotalLikes(
          safeClips.reduce((sum, clip) => sum + (clip.votes || 0), 0)
        );
      }

      const {count: followersCount, error: followersError} = await supabase
        .from("follows")
        .select("*", {count: "exact", head: true})
        .eq("following_id", user.id);

      if (!mounted) return;

      if (followersError) {
        console.error("Followers count error:", followersError.message);
      } else {
        setFollowers(followersCount || 0);
      }

      const {count: followingCount, error: followingError} = await supabase
        .from("follows")
        .select("*", {count: "exact", head: true})
        .eq("follower_id", user.id);

      if (!mounted) return;

      if (followingError) {
        console.error("Following count error:", followingError.message);
      } else {
        setFollowing(followingCount || 0);
      }

      setLoading(false);
    };

    loadUser();

    return () => {
      mounted = false;
    };
  }, []);

  const initial = useMemo(() => {
    return (username?.[0] || email?.[0] || "U").toUpperCase();
  }, [username, email]);

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(t("confirmDelete"));

    if (!confirmed) return;

    setLoadingDelete(true);

    try {
      const {
        data: {session}
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        alert(t("notLoggedIn"));
        setLoadingDelete(false);
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

      if (!res.ok) {
        alert(`${t("deleteError")}: ${data?.error || "Unknown error"}`);
        setLoadingDelete(false);
        return;
      }

      alert(t("deleteSuccess"));

      await supabase.auth.signOut();
      window.location.href = "/";
    } catch (error) {
      console.error(error);
      alert(t("deleteError"));
      setLoadingDelete(false);
    }
  };

  if (loading) {
    return (
      <ProtectedPage>
        <div className="min-h-screen bg-black px-4 py-10 text-white">
          <div className="mx-auto max-w-5xl space-y-6">
            <div className="animate-pulse rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
              <div className="h-5 w-24 rounded bg-white/10" />
              <div className="mt-4 h-10 w-52 rounded bg-white/10" />
              <div className="mt-3 h-4 w-64 rounded bg-white/10" />
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {Array.from({length: 4}).map((_, index) => (
                <div
                  key={index}
                  className="animate-pulse rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl"
                >
                  <div className="h-4 w-20 rounded bg-white/10" />
                  <div className="mt-4 h-8 w-16 rounded bg-white/10" />
                </div>
              ))}
            </div>

            <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="animate-pulse rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
                <div className="h-5 w-32 rounded bg-white/10" />
                <div className="mt-6 space-y-4">
                  <div className="h-16 rounded-2xl bg-white/10" />
                  <div className="h-16 rounded-2xl bg-white/10" />
                </div>
              </div>

              <div className="animate-pulse rounded-3xl border border-red-500/20 bg-red-500/5 p-6 backdrop-blur-xl">
                <div className="h-5 w-28 rounded bg-white/10" />
                <div className="mt-4 h-4 w-40 rounded bg-white/10" />
                <div className="mt-6 h-12 rounded-2xl bg-white/10" />
              </div>
            </div>
          </div>
        </div>
      </ProtectedPage>
    );
  }

  return (
    <ProtectedPage>
      <div className="min-h-screen bg-black px-4 py-10 text-white">
        <div className="mx-auto max-w-5xl space-y-6">
          <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-zinc-900/75 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.42)] backdrop-blur-2xl sm:p-8">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(139,92,246,0.24),transparent_26%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.18),transparent_24%)]" />

            <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 via-fuchsia-500 to-blue-500 text-2xl font-black text-white shadow-[0_0_28px_rgba(139,92,246,0.38)] ring-2 ring-white/10 sm:h-20 sm:w-20 sm:text-3xl">
                  {initial}
                </div>

                <div>
                  <p className="mb-2 inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-zinc-300">
                    {t("section")}
                  </p>

                  <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
                    @{username ?? "User"}
                  </h1>

                  <div className="mt-2 flex items-center gap-2 text-sm text-zinc-400">
                    <Mail size={15} />
                    <span className="break-all">{email ?? "—"}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                {userId && (
                  <Link
                    href={`/profile/${userId}`}
                    className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-sm font-semibold text-white shadow-lg backdrop-blur-xl transition hover:scale-[1.02] hover:bg-white/10"
                  >
                    <User size={16} />
                    Profil ansehen
                  </Link>
                )}

                <Link
                  href="/my-clips"
                  className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-purple-500 via-fuchsia-500 to-blue-500 px-4 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(99,102,241,0.32)] transition hover:scale-[1.02]"
                >
                  <Film size={16} />
                  My Clips
                </Link>
              </div>
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard icon={<Film size={18} />} label="Clips" value={clipCount} />
            <StatCard icon={<Heart size={18} />} label="Gesamtlikes" value={totalLikes} />
            <StatCard icon={<Users size={18} />} label="Followers" value={followers} />
            <StatCard icon={<Users size={18} />} label="Following" value={following} />
          </section>

          <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-3xl border border-white/10 bg-zinc-900/75 p-6 shadow-[0_18px_50px_rgba(0,0,0,0.35)] backdrop-blur-2xl">
              <div className="mb-5">
                <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                  Kontoinformationen
                </p>
                <h2 className="mt-1 text-2xl font-black">Deine Daten</h2>
              </div>

              <div className="space-y-4">
                <InfoRow
                  label={t("username")}
                  value={username ?? "—"}
                />

                <InfoRow
                  label={t("email")}
                  value={email ?? "—"}
                  breakAll
                />
              </div>
            </div>

            <div className="rounded-3xl border border-red-500/20 bg-red-500/5 p-6 shadow-[0_18px_50px_rgba(0,0,0,0.35)] backdrop-blur-2xl">
              <div className="flex items-start gap-3">
                <div className="rounded-2xl bg-red-500/15 p-3 text-red-300 ring-1 ring-red-400/10">
                  <ShieldAlert size={18} />
                </div>

                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-red-300/75">
                    Danger Zone
                  </p>
                  <h2 className="mt-1 text-xl font-black text-red-300">
                    {t("deleteTitle")}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-red-200/80">
                    {t("deleteText")}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={loadingDelete}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-red-500 to-orange-500 px-4 py-3 font-semibold text-white shadow-[0_12px_30px_rgba(239,68,68,0.28)] transition hover:scale-[1.01] hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loadingDelete ? t("deleting") : t("deleteButton")}
                {!loadingDelete && <ChevronRight size={16} />}
              </button>
            </div>
          </section>
        </div>
      </div>
    </ProtectedPage>
  );
}

function StatCard({
  icon,
  label,
  value
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-zinc-900/75 p-5 shadow-[0_18px_50px_rgba(0,0,0,0.35)] backdrop-blur-2xl transition hover:-translate-y-0.5">
      <div className="mb-4 inline-flex rounded-2xl bg-white/6 p-3 text-zinc-300 ring-1 ring-white/10">
        {icon}
      </div>

      <p className="text-sm text-zinc-400">{label}</p>
      <p className="mt-2 text-3xl font-black text-white">{value}</p>
    </div>
  );
}

function InfoRow({
  label,
  value,
  breakAll = false
}: {
  label: string;
  value: string;
  breakAll?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
      <p className="text-sm text-zinc-400">{label}</p>
      <p
        className={`mt-1 text-lg font-semibold text-white ${
          breakAll ? "break-all" : ""
        }`}
      >
        {value}
      </p>
    </div>
  );
}