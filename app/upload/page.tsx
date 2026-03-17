"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabase";

export default function UploadPage() {
  const [title, setTitle] = useState("");
  const [game, setGame] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!title || !game || !file) {
      alert("Alles ausfüllen + Datei wählen!");
      return;
    }

    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("Du musst eingeloggt sein");
      setLoading(false);
      return;
    }

    const fileName = `${Date.now()}-${file.name}`;

    const { error: uploadError } = await supabase.storage
      .from("clips")
      .upload(fileName, file);

    if (uploadError) {
      alert("Upload Fehler: " + uploadError.message);
      setLoading(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from("clips")
      .getPublicUrl(fileName);

    const videoUrl = urlData.publicUrl;

    const { error: insertError } = await supabase.from("clips").insert({
      title,
      game,
      video_url: videoUrl,
      votes: 0,
      user_id: user.id,
    });

    setLoading(false);

    if (insertError) {
      alert("DB Fehler: " + insertError.message);
      return;
    }

    alert("Clip + User gespeichert ✅");

    setTitle("");
    setGame("");
    setFile(null);
  };

  return (
    <div className="min-h-screen text-white">
      <section className="mx-auto max-w-2xl rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
        <h1 className="mb-6 text-3xl font-bold">Clip Upload</h1>

        <div className="space-y-4">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Titel"
            className="w-full rounded-xl bg-zinc-800 p-3 outline-none"
          />

          <input
            value={game}
            onChange={(e) => setGame(e.target.value)}
            placeholder="Game"
            className="w-full rounded-xl bg-zinc-800 p-3 outline-none"
          />

          <input
            type="file"
            accept="video/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="w-full rounded-xl bg-zinc-800 p-3"
          />

          <button
            onClick={handleUpload}
            disabled={loading}
            className="w-full rounded-xl bg-white py-3 font-bold text-black disabled:opacity-50"
          >
            {loading ? "Upload..." : "Clip hochladen"}
          </button>

          <Link
            href="/"
            className="block text-center text-zinc-400 hover:text-white"
          >
            Zurück zur Startseite
          </Link>
        </div>
      </section>
    </div>
  );
}