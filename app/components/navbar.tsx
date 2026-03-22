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
          ? "border-white/20 bg-white/10 text-white shadow-lg"
          : "border-zinc-800 bg-zinc-900/80 text-zinc-400 hover:scale-[1.03] hover:border-white/20 hover:bg-white/10 hover:text-white hover:shadow-lg"
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
          ? "bg-white/10 text-white shadow-lg"
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
  const [userId, setUserId] = useState<string | null>(null);
  const [menuOpenDesktop, setMenuOpenDesktop] = useState(false);
  const [menuOpenMobile, setMenuOpenMobile] = useState(false);
  const [scrolled, setScrolled] = useState(false);

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

      setDisplayName(user?.user_metadata?.username ?? "User");
      setUserId(user?.id ?? null);
    };

    loadUser();

    const {
      data: {subscription}
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;

      setDisplayName(session?.user?.user_metadata?.username ?? "User");
      setUserId(session?.user?.id ?? null);
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

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 12);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, {passive: true});

    return () => {
      window.removeEventListener("scroll", handleScroll);
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
    setUserId(null);
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

  const handleGoToMyProfile = () => {
    if (!userId) return;

    setMenuOpenDesktop(false);
    setMenuOpenMobile(false);
    router.push(`/profile/${userId}`);
    router.refresh();
  };

  const mobileLabel = displayName ? `@${displayName}` : null;

  return (
    <>
      <header
        className={`sticky top-0 z-50 border-b transition-all duration-300 ${
          scrolled
            ? "border-white/10 bg-black/72 backdrop-blur-2xl shadow-[0_10px_35px_rgba(0,0,0,0.55)]"
            : "border-white/5 bg-black/35 backdrop-blur-xl shadow-[0_6px_20px_rgba(0,0,0,0.28)]"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <Link href="/" className="flex min-w-0 items-center gap-3">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 via-fuchsia-500 to-blue-500 text-base font-bold text-white ring-1 ring-white/10 transition-all duration-300 sm:h-11 sm:w-11 sm:text-lg ${
                scrolled
                  ? "shadow-[0_0_30px_rgba(139,92,246,0.55)]"
                  : "shadow-[0_0_20px_rgba(139,92,246,0.35)]"
              }`}
            >
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
              <DesktopNavLink key={link.href} {...link} />
            ))}

            <LanguageSwitcher />

            {displayName ? (
              <div className="relative" ref={desktopMenuRef}>
                <button
                  type="button"
                  onClick={() => setMenuOpenDesktop((prev) => !prev)}
                  className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white backdrop-blur-xl shadow-lg transition hover:scale-[1.03] hover:bg-white/10"
                >
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 via-fuchsia-500 to-blue-500 text-xs font-bold text-white">
                    {displayName?.[0]?.toUpperCase()}
                  </div>
                  {displayName}
                </button>

                {menuOpenDesktop && (
                  <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-white/10 bg-black/80 p-3 shadow-[0_20px_60px_rgba(0,0,0,0.6)] backdrop-blur-2xl">
                    <div className="rounded-xl px-3 py-2">
                      <p className="text-sm font-semibold text-white">
                        @{displayName}
                      </p>
                    </div>

                    <div className="my-2 border-t border-zinc-800" />

                    <div className="px-3 pb-2">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                        Mein Account
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleGoToAccount}
                      className="block w-full rounded-xl px-3 py-2 text-left text-sm text-zinc-300 transition hover:bg-zinc-900 hover:text-white"
                    >
                      {t("accountInfo")}
                    </button>

                    <button
                      type="button"
                      onClick={handleGoToMyProfile}
                      className="block w-full rounded-xl px-3 py-2 text-left text-sm text-zinc-300 transition hover:bg-zinc-900 hover:text-white"
                    >
                      Mein Profil
                    </button>

                    <button
                      type="button"
                      onClick={handleGoToMyClips}
                      className="block w-full rounded-xl px-3 py-2 text-left text-sm text-zinc-300 transition hover:bg-zinc-900 hover:text-white"
                    >
                      {t("myClips")}
                    </button>

                    <div className="my-2 border-t border-zinc-800" />

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="block w-full rounded-xl px-3 py-2 text-left text-sm text-red-400 transition hover:bg-zinc-900 hover:text-red-300"
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
                  className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white shadow-lg backdrop-blur-xl transition hover:bg-white/10"
                >
                  <User size={18} />
                </button>

                {menuOpenMobile && (
                  <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-white/10 bg-black/80 p-3 shadow-[0_20px_60px_rgba(0,0,0,0.6)] backdrop-blur-2xl">
                    <div className="rounded-xl px-3 py-2">
                      <p className="text-sm font-semibold text-white">
                        {mobileLabel}
                      </p>
                    </div>

                    <div className="my-2 border-t border-zinc-800" />

                    <div className="px-3 pb-2">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                        Mein Account
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleGoToAccount}
                      className="block w-full rounded-xl px-3 py-2 text-left text-sm text-zinc-300 transition hover:bg-zinc-900 hover:text-white"
                    >
                      {t("accountInfo")}
                    </button>

                    <button
                      type="button"
                      onClick={handleGoToMyProfile}
                      className="block w-full rounded-xl px-3 py-2 text-left text-sm text-zinc-300 transition hover:bg-zinc-900 hover:text-white"
                    >
                      Mein Profil
                    </button>

                    <button
                      type="button"
                      onClick={handleGoToMyClips}
                      className="block w-full rounded-xl px-3 py-2 text-left text-sm text-zinc-300 transition hover:bg-zinc-900 hover:text-white"
                    >
                      {t("myClips")}
                    </button>

                    <div className="my-2 border-t border-zinc-800" />

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="block w-full rounded-xl px-3 py-2 text-left text-sm text-red-400 transition hover:bg-zinc-900 hover:text-red-300"
                    >
                      {t("logout")}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/auth"
                className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-zinc-300 shadow-lg backdrop-blur-xl"
              >
                {t("login")}
              </Link>
            )}
          </div>
        </div>
      </header>

      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-black/85 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur-2xl md:hidden">
        <div className="mx-auto flex max-w-md items-center gap-1 rounded-3xl border border-white/10 bg-zinc-900/75 p-1.5 shadow-[0_18px_50px_rgba(0,0,0,0.45)] backdrop-blur-xl">
          <MobileNavItem href="/" label={t("home")} icon={<House size={18} />} />
          <MobileNavItem href="/upload" label={t("upload")} icon={<Upload size={18} />} />
          <MobileNavItem href="/feed" label={t("feed")} icon={<Clapperboard size={18} />} />
          <MobileNavItem href="/battle" label={t("battle")} icon={<Swords size={18} />} />
          <MobileNavItem href="/leaderboard" label={t("leaderboard")} icon={<Trophy size={18} />} />
        </div>
      </nav>
    </>
  );
}