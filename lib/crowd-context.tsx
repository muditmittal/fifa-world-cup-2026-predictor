"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

interface CrowdData {
  [matchId: number]: {
    teamA: string | null;
    teamB: string | null;
    picksA: number;
    picksB: number;
    total: number;
  };
}

const CrowdContext = createContext<{ crowd: CrowdData; totalUsers: number }>({ crowd: {}, totalUsers: 0 });

export function CrowdProvider({ children }: { children: ReactNode }) {
  const [crowd, setCrowd] = useState<CrowdData>({});
  const [totalUsers, setTotalUsers] = useState(0);

  useEffect(() => {
    fetch("/api/crowd")
      .then((r) => r.json())
      .then((data) => {
        setCrowd(data.crowd || {});
        setTotalUsers(data.totalUsers || 0);
      })
      .catch(() => {});
  }, []);

  return (
    <CrowdContext.Provider value={{ crowd, totalUsers }}>
      {children}
    </CrowdContext.Provider>
  );
}

export function useCrowd() {
  return useContext(CrowdContext);
}
