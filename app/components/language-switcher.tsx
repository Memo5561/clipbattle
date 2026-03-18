"use client";

import {useLocale} from "next-intl";
import {usePathname, useRouter} from "../../i18n/navigation";

const languages = [
  {code: "de", label: "DE", flag: "🇩🇪"},
  {code: "en", label: "EN", flag: "🇬🇧"},
  {code: "tr", label: "TR", flag: "🇹🇷"}
] as const;

export default function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const changeLanguage = (nextLocale: "de" | "en" | "tr") => {
    router.replace(pathname, {locale: nextLocale});
  };

  return (
    <div className="flex items-center gap-2">
      {languages.map((language) => {
        const active = locale === language.code;

        return (
          <button
            key={language.code}
            type="button"
            onClick={() => changeLanguage(language.code)}
            className={`rounded-xl border px-3 py-2 text-sm font-medium transition ${
              active
                ? "border-white/30 bg-white/15 text-white"
                : "border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-white/20 hover:bg-white/10 hover:text-white"
            }`}
            aria-label={`Sprache wechseln zu ${language.label}`}
          >
            <span className="mr-2">{language.flag}</span>
            {language.label}
          </button>
        );
      })}
    </div>
  );
}