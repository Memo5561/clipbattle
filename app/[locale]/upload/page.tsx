"use client";

import Image from "next/image";
import {useEffect, useState} from "react";
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
  const [preview, setPreview] = useState<string | null>(null);
  const [fileInfo, setFileInfo] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const {data: {user}} = await supabase.auth.getUser();

      if (!user) {
        router.replace("/auth");
        return;
      }

      setCheckingAuth(false);
    };

    checkUser();
  }, [router]);

  // FILE HANDLING
  const handleFileChange = (f: File | null) => {
    if (!f) return;

    // TYPE CHECK
    if (!f.type.startsWith("video/")) {
      alert("Nur Videos erlaubt");
      return;
    }

    // SIZE CHECK (max 100MB)
    if (f.size > 100 * 1024 * 1024) {
      alert("Max 100MB erlaubt");
      return;
    }

    setFile(f);
    setPreview(URL.createObjectURL(f));

    const sizeMB = (f.size / (1024 * 1024)).toFixed(2);
    setFileInfo(`${f.name} • ${sizeMB} MB`);
  };

  const handleUpload = async () => {
    if (!title || !selectedGame || !file) {
      alert(t("alertMissing"));
      return;
    }

    setLoading(true);
    setProgress(10);

    const {data: {user}} = await supabase.auth.getUser();

    const username =
      user?.user_metadata?.username ||
      user?.email?.split("@")[0] ||
      "User";

    const fileName = `${Date.now()}-${file.name}`;

    setProgress(30);

    const {error: uploadError} = await supabase.storage
      .from("clips")
      .upload(fileName, file);

    if (uploadError) {
      alert(uploadError.message);
      setLoading(false);
      return;
    }

    setProgress(70);

    const {data} = supabase.storage
      .from("clips")
      .getPublicUrl(fileName);

    await supabase.from("clips").insert({
      title,
      game: selectedGame.name,
      video_url: data.publicUrl,
      votes: 0,
      user_id: user?.id,
      username
    });

    setProgress(100);

    setTimeout(() => {
      router.push("/feed");
    }, 600);
  };

  if (checkingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  const isReady = title && selectedGame && file;

  return (
    <div className="min-h-screen bg-black text-white px-4 py-10">
      <div className="mx-auto max-w-3xl space-y-8">

        {/* HEADER */}
        <div>
          <h1 className="text-4xl font-black">🚀 Upload Clip</h1>
          <p className="text-zinc-400">Poste deinen besten Moment</p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl space-y-6">

          {/* TITLE */}
          <input
            type="text"
            placeholder="Titel..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 outline-none focus:border-purple-500"
          />

          {/* GAME */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {gameOptions.map((game) => {
              const active = selectedGame?.id === game.id;

              return (
                <button
                  key={game.id}
                  onClick={() => setSelectedGame(game)}
                  className={`rounded-2xl overflow-hidden border transition ${
                    active
                      ? "border-purple-500 ring-2 ring-purple-500"
                      : "border-white/10 hover:border-white/30"
                  }`}
                >
                  <div className="relative aspect-[4/3]">
                    <Image src={game.image} alt={game.name} fill className="object-cover" />
                  </div>
                </button>
              );
            })}
          </div>

          {/* FILE */}
          <label className="block cursor-pointer rounded-2xl border border-dashed border-white/20 p-6 text-center hover:border-purple-500">
            {preview ? (
              <>
                <video src={preview} className="w-full rounded-xl mb-2" controls />
                <p className="text-xs text-zinc-400">{fileInfo}</p>
              </>
            ) : (
              <p className="text-zinc-400">📁 Klick um Video auszuwählen</p>
            )}

            <input
              type="file"
              accept="video/*"
              hidden
              onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
            />
          </label>

          {/* PROGRESS */}
          {loading && (
            <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all"
                style={{width: `${progress}%`}}
              />
            </div>
          )}

          {/* BUTTON */}
          <button
            onClick={handleUpload}
            disabled={!isReady || loading}
            className={`w-full rounded-2xl py-3 font-bold transition ${
              isReady
                ? "bg-gradient-to-r from-purple-500 to-blue-500 hover:scale-[1.02]"
                : "bg-zinc-800 text-zinc-500"
            }`}
          >
            {loading ? `Uploading... ${progress}%` : "Upload 🚀"}
          </button>

          <Link href="/" className="block text-center text-zinc-400 hover:text-white">
            Zurück
          </Link>

        </div>
      </div>
    </div>
  );
}