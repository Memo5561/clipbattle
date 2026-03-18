"use client";

import {useEffect, useState} from "react";
import {useTranslations} from "next-intl";
import {supabase} from "../../../lib/supabase";

type Clip = {
  id: string;
  title: string;
  game: string | null;
  video_url: string;
  votes: number;
  username: string | null;
  user_id: string;
};

export default function MyClipsPage() {
  const t = useTranslations("MyClips");

  const [clips, setClips] = useState<Clip[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchMyClips = async () => {
      setLoading(true);

      const {
        data: {user}
      } = await supabase.auth.getUser();

      if (!user) {
        setUserId(null);
        setClips([]);
        setLoading(false);
        return;
      }

      setUserId(user.id);

      const {data, error} = await supabase
        .from("clips")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", {ascending: false});

      if (error) {
        console.error("Fehler beim Laden der eigenen Clips:", error.message);
        setClips([]);
        setLoading(false);
        return;
      }

      setClips((data as Clip[]) || []);
      setLoading(false);
    };

    fetchMyClips();
  }, []);

  const getStoragePathFromUrl = (url: string) => {
    const marker = "/storage/v1/object/public/clips/";
    const index = url.indexOf(marker);

    if (index === -1) return null;

    const path = url.substring(index + marker.length);
    return decodeURIComponent(path);
  };

  const handleDelete = async (clip: Clip) => {
    const confirmed = window.confirm(t("deleteConfirm"));
    if (!confirmed) return;

    setDeletingId(clip.id);

    const filePath = getStoragePathFromUrl(clip.video_url);

    if (filePath) {
      const {error: storageError} = await supabase.storage
        .from("clips")
        .remove([filePath]);

      if (storageError) {
        alert(t("deleteError") + storageError.message);
        setDeletingId(null);
        return;
      }
    }

    const {error: dbError} = await supabase
      .from("clips")
      .delete()
      .eq("id", clip.id);

    if (dbError) {
      alert(t("deleteError") + dbError.message);
      setDeletingId(null);
      return;
    }

    setClips((prev) => prev.filter((item) => item.id !== clip.id));
    setDeletingId(null);
    alert(t("deleteSuccess"));
  };

  if (loading) {
    return (
      <div className="min-h-screen text-white">
        <section className="mx-auto max-w-7xl rounded-3xl border border-zinc-800 bg-zinc-900/80 p-8 text-center backdrop-blur-xl">
          <p className="text-zinc-400">{t("loading")}</p>
        </section>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="min-h-screen text-white">
        <section className="mx-auto max-w-4xl rounded-3xl border border-zinc-800 bg-zinc-900/80 p-10 text-center backdrop-blur-xl">
          <h1 className="mb-3 text-3xl font-bold">{t("notLoggedIn")}</h1>
          <p className="text-zinc-400">{t("notLoggedInText")}</p>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="rounded-3xl border border-zinc-800 bg-zinc-900/80 p-8 backdrop-blur-xl">
          <p className="mb-3 inline-block rounded-full border border-zinc-700 bg-zinc-800 px-4 py-1 text-xs text-zinc-400">
            {t("badge")}
          </p>

          <h1 className="text-3xl font-bold md:text-4xl">
            {t("title")}
          </h1>

          <p className="mt-2 text-zinc-400">
            {t("subtitle")}
          </p>
        </section>

        {clips.length === 0 ? (
          <section className="rounded-3xl border border-zinc-800 bg-zinc-900/80 p-10 text-center">
            <p className="text-zinc-400">{t("empty")}</p>
          </section>
        ) : (
          <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {clips.map((clip) => (
              <article
                key={clip.id}
                className="overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900/80 shadow-xl"
              >
                <div className="bg-black">
                  <video
                    src={clip.video_url}
                    controls
                    playsInline
                    className="aspect-video w-full object-cover"
                  />
                </div>

                <div className="space-y-3 p-5">
                  <div>
                    <h2 className="line-clamp-1 text-xl font-bold text-white">
                      {clip.title}
                    </h2>

                    <p className="mt-1 text-sm text-zinc-400">
                      {clip.game || t("unknownGame")}
                    </p>
                  </div>

                  <p className="text-sm text-zinc-500">
                    {t("postedBy")}:{" "}
                    <span className="font-medium text-zinc-300">
                      {clip.username || t("unknownUser")}
                    </span>
                  </p>

                  <div className="flex items-center justify-between gap-3">
                    <div className="rounded-full border border-zinc-700 bg-zinc-800 px-3 py-1 text-xs font-medium text-zinc-300">
                      ❤️ {clip.votes} {t("votes")}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDelete(clip)}
                      disabled={deletingId === clip.id}
                      className="rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {deletingId === clip.id ? t("deleting") : t("delete")}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </section>
        )}
      </div>
    </div>
  );
}