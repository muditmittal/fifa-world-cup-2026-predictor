"use client";

/**
 * Maps FIFA 3-letter codes to ISO 3166-1 alpha-2 codes for flag CDN.
 * Uses flagcdn.com which serves SVG flags at any size.
 */
const fifaToIso: Record<string, string> = {
  ARG: "ar", ESP: "es", FRA: "fr", ENG: "gb-eng", POR: "pt", BRA: "br",
  MAR: "ma", NED: "nl", BEL: "be", GER: "de", CRO: "hr", COL: "co",
  MEX: "mx", SEN: "sn", USA: "us", JPN: "jp", SUI: "ch", ECU: "ec",
  AUT: "at", AUS: "au", ALG: "dz", EGY: "eg", CAN: "ca", NOR: "no",
  CIV: "ci", SWE: "se", PAR: "py", COD: "cd", GHA: "gh", RSA: "za",
  BIH: "ba", CPV: "cv", KOR: "kr", IRN: "ir", CZE: "cz", QAT: "qa",
  HAI: "ht", TUR: "tr", CUW: "cw", TUN: "tn", NZL: "nz", URU: "uy",
  KSA: "sa", IRQ: "iq", JOR: "jo", UZB: "uz", PAN: "pa", SCO: "gb-sct",
};

interface CountryFlagProps {
  code: string;
  className?: string;
}

export function CountryFlag({ code, className = "" }: CountryFlagProps) {
  const iso = fifaToIso[code];
  if (!iso) {
    return <span className={className}>🏳️</span>;
  }

  const hasCustomSize = className.includes("w-") || className.includes("h-");

  return (
    <img
      src={`https://flagcdn.com/${iso}.svg`}
      alt={code}
      className={`inline-block rounded-[2px] object-cover shadow-[0_0_0_0.5px_rgba(0,0,0,0.1)] ${hasCustomSize ? className : `w-5 h-[14px] ${className}`}`}
    />
  );
}
