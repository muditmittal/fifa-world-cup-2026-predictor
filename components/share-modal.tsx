"use client";

import { useState } from "react";
import { CountryFlag } from "./country-flag";

interface ShareModalProps {
  username: string;
  avatar: string | null;
  onConfirm: (username: string, avatar: string | null) => void;
  onClose: () => void;
}

export function ShareModal({ username: initialUsername, avatar: initialAvatar, onConfirm, onClose }: ShareModalProps) {
  const [username, setUsername] = useState(initialUsername);
  const [avatar, setAvatar] = useState(initialAvatar);
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    if (!username.trim()) return;
    setLoading(true);
    await onConfirm(username.trim(), avatar);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl shadow-2xl w-[380px] overflow-hidden">
        <div className="px-6 pt-6 pb-4">
          <div className="text-base font-bold text-center">Share your bracket</div>
          <div className="text-xs text-[var(--color-text-muted)] text-center mt-1">
            Your predictions will be visible to everyone who has also shared their brackets publicly.
          </div>
        </div>

        <div className="px-6 pb-6 space-y-4">
          {/* Avatar + Username */}
          <div className="flex items-center gap-3 justify-center">
            <div className="w-14 h-14 rounded-full bg-[var(--color-surface)] border-2 border-[var(--color-border)] flex items-center justify-center overflow-hidden shrink-0">
              {avatar?.startsWith("flag:") ? (
                <CountryFlag code={avatar.replace("flag:", "")} className="!w-8 !h-6" />
              ) : avatar?.startsWith("player:") ? (
                <img
                  src={`/api/avatar?wiki=${encodeURIComponent(getWikiForPlayer(avatar.replace("player:", "")))}`}
                  alt=""
                  className="w-full h-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${avatar?.replace("player:", "")}&size=56&background=eee&color=555&bold=true&format=svg`; }}
                />
              ) : (
                <span className="text-lg font-bold text-[var(--color-text-muted)]">{username.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <div className="flex-1">
              <label className="text-[10px] font-medium text-[var(--color-text-muted)] uppercase tracking-wider">Display name</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full mt-1 px-3 py-2 text-sm bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg outline-none focus:border-[var(--color-accent)] transition-colors"
              />
            </div>
          </div>

          {/* Confirm button */}
          <button
            onClick={handleConfirm}
            disabled={loading || !username.trim()}
            className="w-full py-2.5 text-sm font-medium bg-[var(--color-correct)] text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? "Sharing..." : "Share my bracket"}
          </button>

          <button
            onClick={onClose}
            className="w-full py-2 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

const PLAYER_WIKI: Record<string, string> = {
  messi: "Lionel_Messi", mbappe: "Kylian_Mbappé", haaland: "Erling_Haaland",
  vinicius: "Vinícius_Júnior", bellingham: "Jude_Bellingham", salah: "Mohamed_Salah",
  debruyne: "Kevin_De_Bruyne", rodri: "Rodri_(footballer,_born_1996)", saka: "Bukayo_Saka",
  yamal: "Lamine_Yamal", palmer: "Cole_Palmer", wirtz: "Florian_Wirtz",
  pedri: "Pedri", osimhen: "Victor_Osimhen", hakimi: "Achraf_Hakimi",
  martinez: "Emiliano_Martínez", james: "James_Rodríguez", pulisic: "Christian_Pulisic",
  davies: "Alphonso_Davies", ronaldo: "Cristiano_Ronaldo", neymar: "Neymar",
  modric: "Luka_Modrić", gakpo: "Cody_Gakpo", raphinha: "Raphinha",
  kane: "Harry_Kane", lewandowski: "Robert_Lewandowski",
  diaz: "Luis_Díaz_(Colombian_footballer)", alvarez: "Julián_Álvarez",
  muller: "Thomas_Müller", son: "Son_Heung-min",
};

function getWikiForPlayer(id: string): string {
  return PLAYER_WIKI[id] || id;
}
