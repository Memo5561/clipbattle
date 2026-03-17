"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabase";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleAuth = async () => {
    if (!email || !password) {
      alert("Bitte alles ausfüllen");
      return;
    }

    setLoading(true);

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      setLoading(false);

      if (error) {
        alert("Login Fehler: " + error.message);
        return;
      }

      alert("Eingeloggt ✅");
      window.location.href = "/";
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      setLoading(false);

      if (error) {
        alert("Registrierung Fehler: " + error.message);
        return;
      }

      alert("Account erstellt ✅ (Check ggf. deine E-Mail)");
      window.location.href = "/";
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center text-white">
      <div className="w-full max-w-md rounded-3xl bg-zinc-900 p-8 border border-zinc-800">
        <h1 className="text-3xl font-bold mb-6 text-center">
          {isLogin ? "Login" : "Registrieren"}
        </h1>

        <div className="space-y-4">
          <input
            type="email"
            placeholder="E-Mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 rounded-xl bg-zinc-800 outline-none"
          />

          <input
            type="password"
            placeholder="Passwort"
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
              ? "Lädt..."
              : isLogin
              ? "Einloggen"
              : "Registrieren"}
          </button>

          <button
            onClick={() => setIsLogin(!isLogin)}
            className="w-full py-3 rounded-xl bg-zinc-800"
          >
            {isLogin
              ? "Noch keinen Account? Registrieren"
              : "Schon einen Account? Login"}
          </button>
        </div>
      </div>
    </div>
  );
}