"use client";

import { useState } from "react";

interface SyncButtonProps {
  onSync: () => void | Promise<void>;
  lastSynced: string | null;
}

export function SyncButton({ onSync, lastSynced }: SyncButtonProps) {
  const [syncing, setSyncing] = useState(false);

  const handleSync = async () => {
    setSyncing(true);
    try {
      await onSync();
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleSync}
        disabled={syncing}
        className="flex items-center gap-1.5 px-2 py-1 text-[10px] text-[var(--color-text-muted)] hover:text-[var(--color-text)] border border-[var(--color-border)] rounded-md hover:bg-[var(--color-surface-hover)] transition-colors disabled:opacity-50"
      >
        <svg
          className={`w-3 h-3 ${syncing ? "animate-spin" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
        {syncing ? "Updating..." : "Update"}
      </button>
      {lastSynced && (
        <span className="text-[9px] text-[var(--color-text-muted)] opacity-70">
          {new Date(lastSynced).toLocaleTimeString()}
        </span>
      )}
    </div>
  );
}
