"use client";

import {useEffect, useRef, useState} from "react";
import {useTranslations} from "next-intl";
import {supabase} from "../../lib/supabase";
import {Link, useRouter} from "../../i18n/navigation";
import LanguageSwitcher from "./language-switcher";

function NavLink({
  href,
  label
}: {
  href: string;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-400 transition-all hover:scale-105 hover:border-white/20 hover:bg-white/10 hover:text-white"
    >
      {label}
    </Link>
  );
}

export default function Navbar() {
  const t = useTranslations("Navbar");

  const baseNavLinks = [
    {href: "/", label: t("home")},
    {href: "/upload", label: t("upload")},
    {href: "/feed", label: t("feed")},
    {href: "/battle", label: t("battle")},
    {href: "/leaderboard", label: t("leaderboard")}
  ];

  const [username, setUsername] = useState<string | null>(null);
  const [menuOpenDesktop, setMenuOpenDesktop] = useState(false);
  const [menuOpenMobile, setMenuOpenMobile] = useState(false);

  const desktopMenuRef = useRef<HTMLDivElement | null>(null);
  const mobileMenuRef = useRef<HTMLDivElement | null>(null);

  const router = useRouter();

  useEffect(() => {
    const loadUser = async () => {
      const {
        data: {user}
      } = await supabase.auth.getUser();

      setUsername(user?.user_metadata?.username ?? null);
    };

    loadUser();

    const {
      data: {subscription}
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUsername(session?.user?.user_metadata?.username ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        desktopMenuRef.current &&
        !desktopMenuRef.current.contains(event.target as Node)
      ) {
        setMenuOpenDesktop(false);
      }

      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node)
      ) {
        setMenuOpenMobile(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    const {error} = await supabase.auth.signOut();

    if (error) {
      alert("Logout Fehler: " + error.message);
      return;
    }

    setMenuOpenDesktop(false);
    setMenuOpenMobile(false);
    setUsername(null);

    router.push("/");
    router.refresh();
  };

  const handleGoToMyClips = () => {
    setMenuOpenDesktop(false);
    setMenuOpenMobile(false);
    router.push("/my-clips");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-900/80 bg-black/40 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 text-lg font-bold shadow-lg">
            CB
          </div>

          <div>
            <p className="text-lg font-bold tracking-tight text-white">
              ClipBattle
            </p>
            <p className="text-xs text-zinc-400">
              {t("tagline")}
            </p>
          </div>
        </Link>

        <nav className="hidden flex-wrap items-center gap-2 md:flex">
          {baseNavLinks.map((link) => (
            <NavLink key={link.href} href={link.href} label={link.label} />
          ))}

          <LanguageSwitcher />

          {username ? (
            <div className="relative" ref={desktopMenuRef}>
              <button
                type="button"
                onClick={() => setMenuOpenDesktop((prev) => !prev)}
                className="rounded-xl border border-purple-500/30 bg-purple-500/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-purple-500/20"
              >
                👤 {username}
              </button>

              {menuOpenDesktop && (
                <div className="absolute right-0 mt-2 w-48 rounded-2xl border border-zinc-800 bg-zinc-950 p-2 shadow-2xl">
                  <button
                    type="button"
                    onClick={handleGoToMyClips}
                    className="block w-full rounded-xl px-4 py-2 text-left text-sm text-zinc-300 transition hover:bg-zinc-900 hover:text-white"
                  >
                    {t("myClips")}
                  </button>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="block w-full rounded-xl px-4 py-2 text-left text-sm text-red-400 transition hover:bg-zinc-900 hover:text-red-300"
                  >
                    {t("logout")}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <NavLink href="/auth" label={t("login")} />
          )}
        </nav>
      </div>

      <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-6 pb-4 md:hidden">
        {baseNavLinks.map((link) => (
          <NavLink key={link.href} href={link.href} label={link.label} />
        ))}

        <LanguageSwitcher />

        {username ? (
          <div className="relative" ref={mobileMenuRef}>
            <button
              type="button"
              onClick={() => setMenuOpenMobile((prev) => !prev)}
              className="whitespace-nowrap rounded-xl border border-purple-500/30 bg-purple-500/10 px-4 py-2 text-sm font-medium text-white"
            >
              👤 {username}
            </button>

            {menuOpenMobile && (
              <div className="absolute right-0 mt-2 w-44 rounded-2xl border border-zinc-800 bg-zinc-950 p-2 shadow-2xl">
                <button
                  type="button"
                  onClick={handleGoToMyClips}
                  className="block w-full rounded-xl px-4 py-2 text-left text-sm text-zinc-300 transition hover:bg-zinc-900 hover:text-white"
                >
                  {t("myClips")}
                </button>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="block w-full rounded-xl px-4 py-2 text-left text-sm text-red-400 transition hover:bg-zinc-900 hover:text-red-300"
                >
                  {t("logout")}
                </button>
              </div>
            )}
          </div>
        ) : (
          <NavLink href="/auth" label={t("login")} />
        )}
      </div>
    </header>
  );
}