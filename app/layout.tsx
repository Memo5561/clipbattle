import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "ClipBattle",
  description: "Gaming Clips gegeneinander antreten lassen",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body className="bg-black text-white">
        <nav className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <Link href="/" className="text-2xl font-bold">
              ClipBattle
            </Link>

            <div className="flex flex-wrap gap-3 text-sm">
              <Link
                href="/"
                className="rounded-xl bg-zinc-800 px-4 py-2 transition hover:bg-zinc-700"
              >
                Home
              </Link>

              <Link
                href="/upload"
                className="rounded-xl bg-zinc-800 px-4 py-2 transition hover:bg-zinc-700"
              >
                Upload
              </Link>

              <Link
                href="/feed"
                className="rounded-xl bg-zinc-800 px-4 py-2 transition hover:bg-zinc-700"
              >
                Feed
              </Link>

              <Link
                href="/battle"
                className="rounded-xl bg-zinc-800 px-4 py-2 transition hover:bg-zinc-700"
              >
                Battle
              </Link>

              <Link
                href="/leaderboard"
                className="rounded-xl bg-zinc-800 px-4 py-2 transition hover:bg-zinc-700"
              >
                Leaderboard
              </Link>

              <Link
                href="/auth"
                className="rounded-xl bg-white px-4 py-2 font-medium text-black transition hover:bg-zinc-200"
              >
                Login
              </Link>

              <Link
  href="/my-clips"
  className="rounded-xl bg-zinc-800 px-4 py-2 transition hover:bg-zinc-700"
>
  My Clips
</Link>
            </div>
          </div>
        </nav>

        <main className="mx-auto max-w-6xl px-6 py-6">{children}</main>
      </body>
    </html>
  );
}