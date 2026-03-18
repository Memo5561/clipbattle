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
    if (!email || !password || (!isLogin && !username)) {
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
    } else {
      const {data, error} = await supabase.auth.signUp({
        email,
        password
      });

      if (error) {
        setLoading(false);
        alert(t("alertRegisterError") + error.message);
        return;
      }

      const user = data.user;

      if (user) {
        const {error: updateError} = await supabase.auth.updateUser({
          data: {
            username: username
          }
        });

        if (updateError) {
          setLoading(false);
          alert(t("alertUsernameError") + updateError.message);
          return;
        }
      }

      setLoading(false);
      alert(t("alertCreated"));
      window.location.href = "/";
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center text-white">
      <div className="w-full max-w-md rounded-3xl bg-zinc-900 p-8 border border-zinc-800">
        <h1 className="text-3xl font-bold mb-6 text-center">
          {isLogin ? t("loginTitle") : t("registerTitle")}
        </h1>

        <div className="space-y-4">
          {!isLogin && (
            <input
              type="text"
              placeholder={t("usernamePlaceholder")}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-3 rounded-xl bg-zinc-800 outline-none"
            />
          )}

          <input
            type="email"
            placeholder={t("emailPlaceholder")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 rounded-xl bg-zinc-800 outline-none"
          />

          <input
            type="password"
            placeholder={t("passwordPlaceholder")}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 rounded-xl bg-zinc-800 outline-none"
          />

          <button
            onClick={handleAuth}
            disabled={loading}
            className="w-full py-3 rounded-xl bg-white text-black font-semibold disabled:opacity-50"
          >
            {loading
              ? t("buttonLoading")
              : isLogin
                ? t("buttonLogin")
                : t("buttonRegister")}
          </button>

          <button
            onClick={() => setIsLogin(!isLogin)}
            className="w-full py-3 rounded-xl bg-zinc-800"
          >
            {isLogin ? t("switchToRegister") : t("switchToLogin")}
          </button>
        </div>
      </div>
    </div>
  );
}