"use client";

import {useEffect, useState} from "react";
import {useTranslations} from "next-intl";
import {Link, useRouter} from "../../../i18n/navigation";
import {supabase} from "../../../lib/supabase";

export default function UploadPage() {
  const t = useTranslations("Upload");
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [game, setGame] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    let mounted = true;

    const checkUser = async () => {
      const {
        data: {user}
      } = await supabase.auth.getUser();

      if (!mounted) return;

      if (!user) {
        setCheckingAuth(false);
        router.replace("/auth");
        return;
      }

      setCheckingAuth(false);
    };

    checkUser();

    return () => {
      mounted = false;
    };
  }, [router]);

  const handleUpload = async () => {
    if (!title || !game || !file) {
      alert(t("alertMissing"));
      return;
    }

    setLoading(true);

    const {
      data: {user}
    } = await supabase.auth.getUser();

    if (!user) {
      alert(t("alertLogin"));
      setLoading(false);
      router.replace("/auth");
      return;
    }

    const username = user.user_metadata?.username || t("unknownUser");
    const fileName = `${Date.now()}-${file.name}`;

    const {error: uploadError} = await supabase.storage
      .from("clips")
      .upload(fileName, file);

    if (uploadError) {
      alert(t("alertUploadError") + uploadError.message);
      setLoading(false);
      return;
    }

    const {data: publicUrlData} = supabase.storage
      .from("clips")
      .getPublicUrl(fileName);

    const videoUrl = publicUrlData.publicUrl;

    const {error: insertError} = await supabase.from("clips").insert({
      title,
      game,
      video_url: videoUrl,
      votes: 0,
      user_id: user.id,
      username
    });

    if (insertError) {
      alert(t("alertInsertError") + insertError.message);
      setLoading(false);
      return;
    }

    alert(t("alertSuccess"));

    setTitle("");
    setGame("");
    setFile(null);
    setLoading(false);
  };

  if (checkingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center text-white">
        {t("buttonLoading")}
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white">
      <section className="mx-auto max-w-2xl rounded-3xl border border-zinc-800 bg-zinc-900/80 p-8 backdrop-blur-xl">
        <div className="mb-6">
          <p className="mb-2 inline-block rounded-full border border-zinc-700 bg-zinc-800 px-4 py-1 text-xs text-zinc-400">
            {t("badge")}
          </p>

          <h1 className="text-3xl font-bold md:text-4xl">
            {t("title")}
          </h1>

          <p className="mt-2 text-zinc-400">
            {t("subtitle")}
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm text-zinc-400">
              {t("labelTitle")}
            </label>

            <input
              type="text"
              placeholder={t("placeholderTitle")}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-2xl border border-zinc-800 bg-black/40 px-4 py-3 outline-none transition focus:border-purple-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-zinc-400">
              {t("labelGame")}
            </label>

            <input
              type="text"
              placeholder={t("placeholderGame")}
              value={game}
              onChange={(e) => setGame(e.target.value)}
              className="w-full rounded-2xl border border-zinc-800 bg-black/40 px-4 py-3 outline-none transition focus:border-blue-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-zinc-400">
              {t("labelVideo")}
            </label>

            <input
              type="file"
              accept="video/*"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full rounded-2xl border border-zinc-800 bg-black/40 px-4 py-3 text-zinc-300"
            />
          </div>

          <button
            type="button"
            onClick={handleUpload}
            disabled={loading}
            className="w-full rounded-2xl bg-white py-3 font-semibold text-black transition hover:scale-[1.01] hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? t("buttonLoading") : t("buttonIdle")}
          </button>

          <Link
            href="/"
            className="block text-center text-sm text-zinc-400 transition hover:text-white"
          >
            {t("backHome")}
          </Link>
        </div>
      </section>
    </div>
  );
}