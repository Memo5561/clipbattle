"use client";

import Image from "next/image";
import {useEffect, useMemo, useState} from "react";
import {useTranslations} from "next-intl";
import {Link, useRouter} from "../../../i18n/navigation";
import {supabase} from "../../../lib/supabase";

type GameOption = {
  id: string;
  name: string;
  image: string;
};

const gameOptions: GameOption[] = [
  {id: "fortnite", name: "Fortnite", image: "/games/fortnite.jpg"},
  {id: "warzone", name: "Warzone", image: "/games/warzone.jpg"},
  {id: "valorant", name: "Valorant", image: "/games/valorant.jpg"},
  {id: "fifa", name: "EA Sports FC", image: "/games/fifa.jpg"},
  {id: "minecraft", name: "Minecraft", image: "/games/minecraft.jpg"},
  {id: "gta", name: "GTA", image: "/games/gta.jpg"}
];

export default function UploadPage() {
  const t = useTranslations("Upload");
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [selectedGame, setSelectedGame] = useState<GameOption | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileInfo, setFileInfo] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [success, setSuccess] = useState(false);

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

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleFileChange = (nextFile: File | null) => {
    if (!nextFile) return;

    if (!nextFile.type.startsWith("video/")) {
      alert("Nur Video-Dateien sind erlaubt.");
      return;
    }

    if (nextFile.size > 100 * 1024 * 1024) {
      alert("Maximal 100 MB erlaubt.");
      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    const objectUrl = URL.createObjectURL(nextFile);
    const sizeMB = (nextFile.size / (1024 * 1024)).toFixed(2);

    setFile(nextFile);
    setPreviewUrl(objectUrl);
    setFileInfo(`${nextFile.name} • ${sizeMB} MB`);
  };

  const missingSteps = useMemo(() => {
    const steps: string[] = [];

    if (!title.trim()) steps.push("Titel");
    if (!selectedGame) steps.push("Game");
    if (!file) steps.push("Video");

    return steps;
  }, [title, selectedGame, file]);

  const isReady = missingSteps.length === 0;

  const handleUpload = async () => {
    if (!isReady || !file || !selectedGame) {
      alert(t("alertMissing"));
      return;
    }

    setLoading(true);
    setProgress(10);
    setSuccess(false);

    const {
      data: {user}
    } = await supabase.auth.getUser();

    if (!user) {
      alert(t("alertLogin"));
      setLoading(false);
      router.replace("/auth");
      return;
    }

    const username =
      user.user_metadata?.username || user.email?.split("@")[0] || "User";

    const safeFileName = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`;

    setProgress(30);

    const {error: uploadError} = await supabase.storage
      .from("clips")
      .upload(safeFileName, file);

    if (uploadError) {
      alert(t("alertUploadError") + uploadError.message);
      setLoading(false);
      setProgress(0);
      return;
    }

    setProgress(70);

    const {data: publicUrlData} = supabase.storage
      .from("clips")
      .getPublicUrl(safeFileName);

    const videoUrl = publicUrlData.publicUrl;

    const {error: insertError} = await supabase.from("clips").insert({
      title: title.trim(),
      game: selectedGame.name,
      video_url: videoUrl,
      votes: 0,
      user_id: user.id,
      username
    });

    if (insertError) {
      alert(t("alertInsertError") + insertError.message);
      setLoading(false);
      setProgress(0);
      return;
    }

    setProgress(100);
    setSuccess(true);

    setTimeout(() => {
      router.push("/feed");
    }, 900);
  };

  if (checkingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white">
        <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium backdrop-blur-md">
          {t("buttonLoading")}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black px-4 py-8 text-white sm:px-6 sm:py-10">
      <div className="mx-auto max-w-4xl space-y-8">
        <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-zinc-900/70 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.4)] backdrop-blur-2xl sm:p-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(139,92,246,0.22),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.18),transparent_26%)]" />

          <div className="relative">
            <p className="mb-3 inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs text-zinc-300 backdrop-blur-xl">
              {t("badge")}
            </p>

            <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
              {t("title")}
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400 sm:text-base">
              {t("subtitle")}
            </p>
          </div>
        </section>

        <section className="rounded-[2rem] border border-white/10 bg-zinc-900/70 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.4)] backdrop-blur-2xl sm:p-8">
          <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
            <div className="space-y-6">
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-300">
                  {t("labelTitle")}
                </label>

                <input
                  type="text"
                  placeholder={t("placeholderTitle")}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition placeholder:text-zinc-500 focus:border-purple-500 focus:bg-black/55"
                />
              </div>

              <div>
                <label className="mb-3 block text-sm font-medium text-zinc-300">
                  {t("labelGame")}
                </label>

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  {gameOptions.map((game) => {
                    const isActive = selectedGame?.id === game.id;

                    return (
                      <button
                        key={game.id}
                        type="button"
                        onClick={() => setSelectedGame(game)}
                        className={`overflow-hidden rounded-2xl border text-left transition active:scale-95 ${
                          isActive
                            ? "scale-[1.02] border-purple-500 bg-purple-500/15 ring-2 ring-purple-500 shadow-[0_12px_30px_rgba(139,92,246,0.28)]"
                            : "border-white/10 bg-black/25 hover:scale-[1.02] hover:border-white/20 hover:bg-white/5"
                        }`}
                      >
                        <div className="relative aspect-[4/3] w-full bg-zinc-800">
                          <Image
                            src={game.image}
                            alt={game.name}
                            fill
                            className="object-cover"
                          />

                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                          {isActive && (
                            <div className="absolute right-2 top-2 rounded-full bg-purple-500 px-2 py-1 text-xs font-bold text-white shadow-md">
                              ✓
                            </div>
                          )}
                        </div>

                        <div className="px-3 py-3">
                          <p className="text-sm font-semibold text-white">
                            {game.name}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {selectedGame && (
                  <p className="mt-3 text-sm text-zinc-400">
                    Ausgewählt:{" "}
                    <span className="font-semibold text-white">
                      {selectedGame.name}
                    </span>
                  </p>
                )}
              </div>

              <div>
                <label className="mb-3 block text-sm font-medium text-zinc-300">
                  {t("labelVideo")}
                </label>

                <label className="block cursor-pointer rounded-3xl border border-dashed border-white/15 bg-black/25 p-5 transition hover:border-purple-500 hover:bg-white/5">
                  {!previewUrl ? (
                    <div className="flex min-h-[180px] flex-col items-center justify-center rounded-2xl border border-white/8 bg-black/30 px-6 text-center">
                      <p className="text-lg font-semibold text-white">
                        📁 Video auswählen
                      </p>
                      <p className="mt-2 text-sm text-zinc-400">
                        MP4, WebM oder andere Videoformate • max. 100 MB
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="overflow-hidden rounded-2xl border border-white/10 bg-black">
                        <video
                          src={previewUrl}
                          controls
                          playsInline
                          className="max-h-[440px] w-full bg-black object-contain"
                        />
                      </div>

                      {fileInfo && (
                        <p className="text-center text-xs text-zinc-400">
                          {fileInfo}
                        </p>
                      )}
                    </div>
                  )}

                  <input
                    type="file"
                    accept="video/*"
                    hidden
                    onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                  />
                </label>
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-3xl border border-white/10 bg-black/25 p-5 shadow-lg">
                <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                  Upload Status
                </p>

                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-400">Titel</span>
                    <span className={title.trim() ? "text-emerald-400" : "text-zinc-500"}>
                      {title.trim() ? "Fertig" : "Fehlt"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-400">Game</span>
                    <span className={selectedGame ? "text-emerald-400" : "text-zinc-500"}>
                      {selectedGame ? "Fertig" : "Fehlt"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-400">Video</span>
                    <span className={file ? "text-emerald-400" : "text-zinc-500"}>
                      {file ? "Fertig" : "Fehlt"}
                    </span>
                  </div>
                </div>

                {!isReady && (
                  <div className="mt-5 rounded-2xl border border-amber-500/15 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
                    Noch nötig: {missingSteps.join(", ")}
                  </div>
                )}

                {loading && (
                  <div className="mt-5 space-y-2">
                    <div className="flex items-center justify-between text-xs text-zinc-400">
                      <span>Upload läuft...</span>
                      <span>{progress}%</span>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-purple-500 via-fuchsia-500 to-blue-500 transition-all duration-300"
                        style={{width: `${progress}%`}}
                      />
                    </div>
                  </div>
                )}

                {success && (
                  <div className="mt-5 rounded-2xl border border-emerald-500/15 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                    Erfolgreich hochgeladen 🚀 Weiterleitung zum Feed...
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={handleUpload}
                disabled={!isReady || loading}
                className={`w-full rounded-2xl py-3.5 text-sm font-bold transition ${
                  !isReady || loading
                    ? "cursor-not-allowed bg-zinc-800 text-zinc-500"
                    : "bg-gradient-to-r from-purple-500 via-fuchsia-500 to-blue-500 text-white shadow-[0_12px_35px_rgba(99,102,241,0.35)] hover:scale-[1.01] hover:shadow-[0_18px_45px_rgba(99,102,241,0.45)]"
                }`}
              >
                {loading ? `Uploading... ${progress}%` : t("buttonIdle")}
              </button>

              <Link
                href="/"
                className="block text-center text-sm text-zinc-400 transition hover:text-white"
              >
                {t("backHome")}
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}