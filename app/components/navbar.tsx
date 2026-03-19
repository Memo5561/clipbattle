"use client";

import {useEffect, useRef, useState} from "react";
import {useTranslations} from "next-intl";
import {supabase} from "../../lib/supabase";
import {Link, usePathname, useRouter} from "../../i18n/navigation";
import LanguageSwitcher from "./language-switcher";
import {
  House,
  Upload,
  Clapperboard,
  Swords,
  Trophy,
  User
} from "lucide-react";

function DesktopNavLink({
  href,
  label
}: {
  href: string;
  label: string;
}) {
  const pathname = usePathname();
  const active = pathname === href;

  return (
    <Link
      href={href}
      className={`rounded-xl border px-4 py-2 text-sm font-medium transition-all ${
        active
          ? "border-white/20 bg-white/10 text-white"
          : "border-zinc-800 bg-zinc-900 text-zinc-400 hover:scale-105 hover:border-white/20 hover:bg-white/10 hover:text-white"
      }`}
    >
      {label}
    </Link>
  );
}

function MobileNavItem({
  href,
  label,
  icon
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
}) {
  const pathname = usePathname();
  const active = pathname === href;

  return (
    <Link
      href={href}
      className={`flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-[11px] font-medium transition ${
        active
          ? "bg-white/10 text-white"
          : "text-zinc-400 hover:bg-white/5 hover:text-white"
      }`}
    >
      <div className="flex h-5 items-center justify-center">{icon}</div>
      <span className="truncate">{label}</span>
    </Link>
  );
}

export default function Navbar() {
  const t = useTranslations("Navbar");
  const router = useRouter();
  const pathname = usePathname();

  const [displayName, setDisplayName] = useState<string | null>(null);
  const [menuOpenDesktop, setMenuOpenDesktop] = useState(false);
  const [menuOpenMobile, setMenuOpenMobile] = useState(false);

  const desktopMenuRef = useRef<HTMLDivElement | null>(null);
  const mobileMenuRef = useRef<HTMLDivElement | null>(null);

  const desktopNavLinks = [
    {href: "/", label: t("home")},
    {href: "/upload", label: t("upload")},
    {href: "/feed", label: t("feed")},
    {href: "/battle", label: t("battle")},
    {href: "/leaderboard", label: t("leaderboard")}
  ];

  useEffect(() => {
    let mounted = true;

    const loadUser = async () => {
      const {
        data: {user}
      } = await supabase.auth.getUser();

      if (!mounted) return;

      setDisplayName(user?.user_metadata?.username ?? user?.email ?? null);
    };

    loadUser();

    const {
      data: {subscription}
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;

      setDisplayName(
        session?.user?.user_metadata?.username ?? session?.user?.email ?? null
      );
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    setMenuOpenDesktop(false);
    setMenuOpenMobile(false);
  }, [pathname]);

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
    setDisplayName(null);
    router.replace("/");
    router.refresh();
  };

  const handleGoToMyClips = () => {
    setMenuOpenDesktop(false);
    setMenuOpenMobile(false);
    router.push("/my-clips");
    router.refresh();
  };

  const handleGoToAccount = () => {
    setMenuOpenDesktop(false);
    setMenuOpenMobile(false);
    router.push("/account");
    router.refresh();
  };

  const mobileLabel = displayName?.includes("@")
    ? displayName
    : displayName
      ? `@${displayName}`
      : null;

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-zinc-900/80 bg-black/60 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <Link href="/" className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 text-base font-bold shadow-lg sm:h-11 sm:w-11 sm:text-lg">
              CB
            </div>

            <div className="min-w-0">
              <p className="truncate text-base font-bold tracking-tight text-white sm:text-lg">
                ClipBattle
              </p>
              <p className="hidden text-xs text-zinc-400 sm:block">
                {t("tagline")}
              </p>
            </div>
          </Link>

          <nav className="hidden flex-wrap items-center gap-2 md:flex">
            {desktopNavLinks.map((link) => (
              <DesktopNavLink
                key={link.href}
                href={link.href}
                label={link.label}
              />
            ))}

            <LanguageSwitcher />

            {displayName ? (
              <div className="relative" ref={desktopMenuRef}>
                <button
                  type="button"
                  onClick={() => setMenuOpenDesktop((prev) => !prev)}
                  className="rounded-xl border border-purple-500/30 bg-purple-500/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-purple-500/20"
                >
                  👤 {displayName}
                </button>

                {menuOpenDesktop && (
                  <div className="absolute right-0 mt-2 w-48 rounded-2xl border border-zinc-800 bg-zinc-950 p-2 shadow-2xl">
                    <button
                      type="button"
                      onClick={handleGoToAccount}
                      className="block w-full rounded-xl px-4 py-2 text-left text-sm text-zinc-300 transition hover:bg-zinc-900 hover:text-white"
                    >
                      {t("accountInfo")}
                    </button>

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
              <DesktopNavLink href="/auth" label={t("login")} />
            )}
          </nav>

          <div className="flex items-center gap-2 md:hidden">
            <LanguageSwitcher />

            {displayName ? (
              <div className="relative" ref={mobileMenuRef}>
                <button
                  type="button"
                  onClick={() => setMenuOpenMobile((prev) => !prev)}
                  className="flex h-10 w-10 items-center justify-center rounded-2xl border border-purple-500/30 bg-purple-500/10 text-white"
                >
                  <User size={18} />
                </button>

                {menuOpenMobile && (
                  <div className="absolute right-0 mt-2 w-48 rounded-2xl border border-zinc-800 bg-zinc-950 p-2 shadow-2xl">
                    <div className="mb-1 rounded-xl px-4 py-2 text-sm text-zinc-400">
                      {mobileLabel}
                    </div>

                    <button
                      type="button"
                      onClick={handleGoToAccount}
                      className="block w-full rounded-xl px-4 py-2 text-left text-sm text-zinc-300 transition hover:bg-zinc-900 hover:text-white"
                    >
                      {t("accountInfo")}
                    </button>

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
              <Link
                href="/auth"
                className="rounded-2xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm font-medium text-zinc-300"
              >
                {t("login")}
              </Link>
            )}
          </div>
        </div>
      </header>

      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-zinc-800 bg-black/90 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur-xl md:hidden">
        <div className="mx-auto flex max-w-md items-center gap-1 rounded-3xl border border-zinc-800 bg-zinc-900/80 p-1.5 shadow-2xl">
          <MobileNavItem
            href="/"
            label={t("home")}
            icon={<House size={18} />}
          />
          <MobileNavItem
            href="/upload"
            label={t("upload")}
            icon={<Upload size={18} />}
          />
          <MobileNavItem
            href="/feed"
            label={t("feed")}
            icon={<Clapperboard size={18} />}
          />
          <MobileNavItem
            href="/battle"
            label={t("battle")}
            icon={<Swords size={18} />}
          />
          <MobileNavItem
            href="/leaderboard"
            label={t("leaderboard")}
            icon={<Trophy size={18} />}
          />
        </div>
      </nav>
    </>
  );
}