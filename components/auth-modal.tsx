"use client";

import { useState } from "react";
import { CountryFlag } from "./country-flag";

interface AuthModalProps {
  onAuth: (user: { id: number; username: string; avatar?: string | null }) => void;
}

const PLAYER_AVATARS = [
  { id: "messi", name: "Messi", country: "ARG" },
  { id: "mbappe", name: "Mbappé", country: "FRA" },
  { id: "haaland", name: "Haaland", country: "NOR" },
  { id: "vinicius", name: "Vinícius Jr", country: "BRA" },
  { id: "bellingham", name: "Bellingham", country: "ENG" },
  { id: "salah", name: "Salah", country: "EGY" },
  { id: "debruyne", name: "De Bruyne", country: "BEL" },
  { id: "rodri", name: "Rodri", country: "ESP" },
  { id: "saka", name: "Saka", country: "ENG" },
  { id: "yamal", name: "Yamal", country: "ESP" },
  { id: "palmer", name: "Palmer", country: "ENG" },
  { id: "wirtz", name: "Wirtz", country: "GER" },
  { id: "pedri", name: "Pedri", country: "ESP" },
  { id: "osimhen", name: "Osimhen", country: "CIV" },
  { id: "hakimi", name: "Hakimi", country: "MAR" },
  { id: "martinez", name: "E. Martínez", country: "ARG" },
  { id: "james", name: "James", country: "COL" },
  { id: "pulisic", name: "Pulisic", country: "USA" },
  { id: "davies", name: "Davies", country: "CAN" },
  { id: "ronaldo", name: "Ronaldo", country: "POR" },
  { id: "neymar", name: "Neymar", country: "BRA" },
  { id: "modric", name: "Modrić", country: "CRO" },
  { id: "gakpo", name: "Gakpo", country: "NED" },
  { id: "raphinha", name: "Raphinha", country: "BRA" },
  { id: "kane", name: "Kane", country: "ENG" },
  { id: "lewandowski", name: "Lewandowski", country: "AUS" },
  { id: "diaz", name: "L. Díaz", country: "COL" },
  { id: "alvarez", name: "J. Álvarez", country: "ARG" },
  { id: "muller", name: "Müller", country: "GER" },
  { id: "son", name: "Son", country: "KOR" },
];

const FLAG_AVATARS = ["ARG", "BRA", "FRA", "ENG", "ESP", "GER", "POR", "NED", "BEL", "USA", "MEX", "COL", "CAN", "MAR", "JPN", "AUS"];

export function AuthModal({ onAuth }: AuthModalProps) {
  const [mode, setMode] = useState<"login" | "signup">("signup");
  const [username, setUsername] = useState("");
  const [pin, setPin] = useState("");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!username.trim()) {
      setError("Enter a username");
      return;
    }
    if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
      setError("PIN must be exactly 4 digits");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: mode, username: username.trim(), pin, avatar }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        return;
      }

      localStorage.setItem("wc_user", JSON.stringify(data.user));
      onAuth(data.user);
    } catch {
      setError("Connection failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl shadow-2xl w-[400px] max-h-[85vh] flex flex-col overflow-hidden">
        <div className="p-6 pb-4 text-center">
          <div className="text-xl font-bold">World Cup Predictor</div>
          <div className="text-sm text-[var(--color-text-muted)] mt-1">
            {mode === "signup" ? "Pick your hero & start predicting" : "Welcome back"}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 pb-6 space-y-4">
          {/* Avatar selection — signup only */}
          {mode === "signup" && (
            <div>
              <label className="text-[10px] font-medium text-[var(--color-text-muted)] uppercase tracking-wider">Choose your avatar</label>
              <div className="mt-2 grid grid-cols-8 gap-1.5 max-h-[140px] overflow-y-auto p-1 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)]">
                {FLAG_AVATARS.map((code) => (
                  <button
                    key={`flag-${code}`}
                    type="button"
                    onClick={() => setAvatar(`flag:${code}`)}
                    className={`w-9 h-9 flex items-center justify-center rounded-lg transition-all ${
                      avatar === `flag:${code}` ? "ring-2 ring-[var(--color-accent)] bg-[var(--color-accent)]/10" : "hover:bg-[var(--color-surface-hover)]"
                    }`}
                  >
                    <CountryFlag code={code} />
                  </button>
                ))}
                {PLAYER_AVATARS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setAvatar(`player:${p.id}`)}
                    className={`w-9 h-9 flex items-center justify-center rounded-lg transition-all relative group ${
                      avatar === `player:${p.id}` ? "ring-2 ring-[var(--color-accent)] bg-[var(--color-accent)]/10" : "hover:bg-[var(--color-surface-hover)]"
                    }`}
                    title={p.name}
                  >
                    <img
                      src={`https://ui-avatars.com/api/?name=${p.name.split(" ").pop()}&size=32&background=random&bold=true&format=svg`}
                      alt={p.name}
                      className="w-7 h-7 rounded-full"
                    />
                  </button>
                ))}
              </div>
              {avatar && (
                <div className="mt-1.5 text-[11px] text-[var(--color-text-muted)]">
                  Selected: {avatar.startsWith("flag:") ? avatar.replace("flag:", "") : PLAYER_AVATARS.find(p => `player:${p.id}` === avatar)?.name}
                </div>
              )}
            </div>
          )}

          <div>
            <label className="text-[10px] font-medium text-[var(--color-text-muted)] uppercase tracking-wider">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. mudit"
              autoFocus={mode === "login"}
              className="w-full mt-1 px-3 py-2.5 text-sm bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg outline-none focus:border-[var(--color-accent)] transition-colors"
            />
          </div>

          <div>
            <label className="text-[10px] font-medium text-[var(--color-text-muted)] uppercase tracking-wider">4-Digit PIN</label>
            <input
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
              placeholder="••••"
              className="w-full mt-1 px-3 py-2.5 text-sm bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg outline-none focus:border-[var(--color-accent)] transition-colors font-[family-name:var(--font-geist-mono)] tracking-[0.3em]"
            />
          </div>

          {error && (
            <div className="text-xs text-[var(--color-incorrect)] font-medium">{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 text-sm font-medium bg-[var(--color-accent)] text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? "..." : mode === "signup" ? "Start Predicting" : "Sign In"}
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => { setMode(mode === "signup" ? "login" : "signup"); setError(""); }}
              className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
            >
              {mode === "signup" ? "Already have an account? Sign in" : "New here? Create account"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
