"use client";

import {useState} from "react";
import {useTranslations} from "next-intl";
import {supabase} from "../../../lib/supabase";

export default function AuthPage() {
  const t = useTranslations("Auth");

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleAuth = async () => {
    if (!email || !password || (!isLogin && !username.trim())) {
      alert(t("alertFillAll"));
      return;
    }

    setLoading(true);

    if (isLogin) {
      const {error} = await supabase.auth.signInWithPassword({
        email,
        password
      });

      setLoading(false);

      if (error) {
        alert(t("alertLoginError") + error.message);
        return;
      }

      alert(t("alertLoggedIn"));
      window.location.href = "/";
      return;
    }

    const cleanUsername = username.trim();

    const {data, error} = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: cleanUsername
        }
      }
    });

    if (error) {
      setLoading(false);
      alert(t("alertRegisterError") + error.message);
      return;
    }

    const user = data.user;

    if (!user) {
      setLoading(false);
      alert(t("alertRegisterError") + "User konnte nicht erstellt werden.");
      return;
    }

    const {error: profileError} = await supabase.from("profiles").upsert({
      id: user.id,
      username: cleanUsername,
      email: email
    });

    setLoading(false);

    if (profileError) {
      alert(t("alertUsernameError") + profileError.message);
      return;
    }

    alert(t("alertCreated"));
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen flex items-center justify-center text-white">
      <div className="w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
        <h1 className="mb-6 text-center text-3xl font-bold">
          {isLogin ? t("loginTitle") : t("registerTitle")}
        </h1>

        <div className="space-y-4">
          {!isLogin && (
            <input
              type="text"
              placeholder={t("usernamePlaceholder")}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-xl bg-zinc-800 p-3 outline-none"
            />
          )}

          <input
            type="email"
            placeholder={t("emailPlaceholder")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl bg-zinc-800 p-3 outline-none"
          />

          <input
            type="password"
            placeholder={t("passwordPlaceholder")}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl bg-zinc-800 p-3 outline-none"
          />

          <button
            onClick={handleAuth}
            disabled={loading}
            className="w-full rounded-xl bg-white py-3 font-semibold text-black disabled:opacity-50"
          >
            {loading
              ? t("buttonLoading")
              : isLogin
                ? t("buttonLogin")
                : t("buttonRegister")}
          </button>

          <button
            onClick={() => setIsLogin(!isLogin)}
            className="w-full rounded-xl bg-zinc-800 py-3"
          >
            {isLogin ? t("switchToRegister") : t("switchToLogin")}
          </button>
        </div>
      </div>
    </div>
  );
}