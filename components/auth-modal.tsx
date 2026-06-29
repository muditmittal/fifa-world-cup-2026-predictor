"use client";

import { useState, useRef } from "react";
import { CountryFlag } from "./country-flag";

interface AuthModalProps {
  onAuth: (user: { id: number; username: string; avatar?: string | null }) => void;
  defaultMode?: "login" | "signup";
}

// Wikipedia page titles for thumbnail images via REST API
const PLAYER_AVATARS = [
  { id: "messi", name: "Messi", country: "ARG", wiki: "Lionel_Messi" },
  { id: "mbappe", name: "Mbappé", country: "FRA", wiki: "Kylian_Mbappé" },
  { id: "haaland", name: "Haaland", country: "NOR", wiki: "Erling_Haaland" },
  { id: "vinicius", name: "Vinícius Jr", country: "BRA", wiki: "Vinícius_Júnior" },
  { id: "bellingham", name: "Bellingham", country: "ENG", wiki: "Jude_Bellingham" },
  { id: "salah", name: "Salah", country: "EGY", wiki: "Mohamed_Salah" },
  { id: "debruyne", name: "De Bruyne", country: "BEL", wiki: "Kevin_De_Bruyne" },
  { id: "rodri", name: "Rodri", country: "ESP", wiki: "Rodri_(footballer,_born_1996)" },
  { id: "saka", name: "Saka", country: "ENG", wiki: "Bukayo_Saka" },
  { id: "yamal", name: "Yamal", country: "ESP", wiki: "Lamine_Yamal" },
  { id: "palmer", name: "Palmer", country: "ENG", wiki: "Cole_Palmer" },
  { id: "wirtz", name: "Wirtz", country: "GER", wiki: "Florian_Wirtz" },
  { id: "pedri", name: "Pedri", country: "ESP", wiki: "Pedri" },
  { id: "osimhen", name: "Osimhen", country: "CIV", wiki: "Victor_Osimhen" },
  { id: "hakimi", name: "Hakimi", country: "MAR", wiki: "Achraf_Hakimi" },
  { id: "martinez", name: "E. Martínez", country: "ARG", wiki: "Emiliano_Martínez" },
  { id: "james", name: "James", country: "COL", wiki: "James_Rodríguez" },
  { id: "pulisic", name: "Pulisic", country: "USA", wiki: "Christian_Pulisic" },
  { id: "davies", name: "Davies", country: "CAN", wiki: "Alphonso_Davies" },
  { id: "ronaldo", name: "Ronaldo", country: "POR", wiki: "Cristiano_Ronaldo" },
  { id: "neymar", name: "Neymar", country: "BRA", wiki: "Neymar" },
  { id: "modric", name: "Modrić", country: "CRO", wiki: "Luka_Modrić" },
  { id: "gakpo", name: "Gakpo", country: "NED", wiki: "Cody_Gakpo" },
  { id: "raphinha", name: "Raphinha", country: "BRA", wiki: "Raphinha" },
  { id: "kane", name: "Kane", country: "ENG", wiki: "Harry_Kane" },
  { id: "lewandowski", name: "Lewandowski", country: "POL", wiki: "Robert_Lewandowski" },
  { id: "diaz", name: "L. Díaz", country: "COL", wiki: "Luis_Díaz_(Colombian_footballer)" },
  { id: "alvarez", name: "J. Álvarez", country: "ARG", wiki: "Julián_Álvarez" },
  { id: "muller", name: "Müller", country: "GER", wiki: "Thomas_Müller" },
  { id: "son", name: "Son", country: "KOR", wiki: "Son_Heung-min" },
];

function getPlayerImageUrl(player: typeof PLAYER_AVATARS[0]): string {
  // Wikipedia REST API page/summary returns a thumbnail — use as image src via redirect
  return `/api/avatar?wiki=${encodeURIComponent(player.wiki)}`;
}

const FLAG_AVATARS = ["ARG", "BRA", "FRA", "ENG", "ESP", "GER", "POR", "NED", "BEL", "USA", "MEX", "COL", "CAN", "MAR", "JPN", "AUS"];

export function AuthModal({ onAuth, defaultMode = "signup" }: AuthModalProps) {
  const [mode, setMode] = useState<"login" | "signup">(defaultMode);
  const [username, setUsername] = useState(() => {
    if (typeof window === "undefined") return "";
    try {
      const stored = localStorage.getItem("wc_last_username");
      return stored || "";
    } catch { return ""; }
  });
  const [pin, setPin] = useState("");
  const [avatar, setAvatar] = useState<string | null>("player:messi");
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
      localStorage.setItem("wc_last_username", data.user.username);
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
          <div className="text-xl font-bold">FIFA26 Predictor</div>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 pb-6 space-y-4 flex flex-col items-center">
          {/* Avatar + Username row */}
          <div>
            <label className="text-[10px] font-medium text-[var(--color-text-muted)] uppercase tracking-wider">Nickname</label>
            <div className="flex items-center gap-2 mt-1">
              {/* Avatar */}
              <AvatarDropdown
                value={avatar}
                onChange={setAvatar}
                players={PLAYER_AVATARS}
                flags={FLAG_AVATARS}
                disabled={mode === "login"}
              />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. mudit"
                autoFocus={mode === "login" && !username}
                className="w-[160px] px-3 h-12 text-sm bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg outline-none focus:border-[var(--color-accent)] transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-medium text-[var(--color-text-muted)] uppercase tracking-wider">4-Digit PIN</label>
            <PinInput value={pin} onChange={setPin} autoFocus={mode === "login" && !!username} />
          </div>

          {error && (
            <div className="text-xs text-[var(--color-incorrect)] font-medium">{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-[216px] py-2.5 text-sm font-medium bg-[var(--color-accent)] text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
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

function PinInput({ value, onChange, autoFocus }: { value: string; onChange: (v: string) => void; autoFocus?: boolean }) {
  const digits = value.padEnd(4, "").split("").slice(0, 4);
  const refs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  const handleChange = (idx: number, char: string) => {
    if (!/^\d$/.test(char)) return;
    const newDigits = [...digits];
    newDigits[idx] = char;
    const newPin = newDigits.join("").replace(/[^\d]/g, "");
    onChange(newPin);
    if (idx < 3) {
      refs[idx + 1].current?.focus();
    }
  };

  const handleKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      const newDigits = [...digits];
      if (digits[idx] && digits[idx] !== " ") {
        newDigits[idx] = " ";
        onChange(newDigits.join("").trimEnd());
      } else if (idx > 0) {
        newDigits[idx - 1] = " ";
        onChange(newDigits.join("").trimEnd());
        refs[idx - 1].current?.focus();
      }
    }
    if (e.key === "ArrowLeft" && idx > 0) {
      refs[idx - 1].current?.focus();
    }
    if (e.key === "ArrowRight" && idx < 3) {
      refs[idx + 1].current?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 4);
    onChange(pasted);
    const focusIdx = Math.min(pasted.length, 3);
    refs[focusIdx].current?.focus();
  };

  return (
    <div className="flex gap-2 mt-2">
      {[0, 1, 2, 3].map((idx) => (
        <input
          key={idx}
          ref={refs[idx]}
          type="password"
          inputMode="numeric"
          maxLength={1}
          value={digits[idx]?.trim() || ""}
          autoFocus={autoFocus && idx === 0}
          onChange={(e) => handleChange(idx, e.target.value)}
          onKeyDown={(e) => handleKeyDown(idx, e)}
          onPaste={handlePaste}
          className="w-12 h-12 text-center text-lg font-bold font-[family-name:var(--font-geist-mono)] bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg outline-none focus:border-[var(--color-accent)] transition-colors"
        />
      ))}
    </div>
  );
}

function AvatarDropdown({ value, onChange, players, flags, disabled }: {
  value: string | null;
  onChange: (v: string) => void;
  players: typeof PLAYER_AVATARS;
  flags: string[];
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);

  const selectedPlayer = value?.startsWith("player:") ? players.find(p => `player:${p.id}` === value) : null;
  const selectedFlag = value?.startsWith("flag:") ? value.replace("flag:", "") : null;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => !disabled && setOpen(!open)}
        className={`w-12 h-12 rounded-full overflow-hidden border-2 transition-colors shrink-0 ${disabled ? "border-[var(--color-border)] cursor-default" : "border-[var(--color-border)] hover:border-[var(--color-accent)]"}`}
      >
        {selectedPlayer ? (
          <img
            src={getPlayerImageUrl(selectedPlayer)}
            alt={selectedPlayer.name}
            className="w-full h-full object-cover"
            onError={(e) => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${selectedPlayer.name.split(" ").pop()}&size=44&background=eee&color=555&bold=true&format=svg`; }}
          />
        ) : selectedFlag ? (
          <div className="w-full h-full flex items-center justify-center bg-[var(--color-surface)]">
            <CountryFlag code={selectedFlag} />
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-[var(--color-surface)] text-xs text-[var(--color-text-muted)]">?</div>
        )}
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-2 w-[280px] max-h-[240px] overflow-y-auto bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg shadow-xl z-50 p-2 grid grid-cols-6 gap-1.5">
          {players.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => { onChange(`player:${p.id}`); setOpen(false); }}
              className={`w-10 h-10 rounded-full overflow-hidden transition-all ${
                value === `player:${p.id}` ? "ring-2 ring-[var(--color-accent)]" : "hover:ring-1 hover:ring-[var(--color-border)]"
              }`}
              title={p.name}
            >
              <img
                src={getPlayerImageUrl(p)}
                alt={p.name}
                className="w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${p.name.split(" ").pop()}&size=40&background=eee&color=555&bold=true&format=svg`; }}
              />
            </button>
          ))}
          {flags.map((code) => (
            <button
              key={`flag-${code}`}
              type="button"
              onClick={() => { onChange(`flag:${code}`); setOpen(false); }}
              className={`w-10 h-10 rounded-full flex items-center justify-center border border-[var(--color-border)] transition-all ${
                value === `flag:${code}` ? "ring-2 ring-[var(--color-accent)]" : "hover:ring-1 hover:ring-[var(--color-border)]"
              }`}
            >
              <CountryFlag code={code} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
