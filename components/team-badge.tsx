import { Team } from "@/lib/data";

export function TeamBadge({
  team,
  size = "md",
}: {
  team: Team;
  size?: "sm" | "md" | "lg";
}) {
  const dim =
    size === "sm" ? "h-7 w-7 text-[10px]" : size === "lg" ? "h-12 w-12 text-sm" : "h-9 w-9 text-xs";
  return (
    <div
      className={`flex ${dim} shrink-0 items-center justify-center rounded-full font-bold tracking-tight text-white shadow-sm ring-1 ring-white/10`}
      style={{
        background: `linear-gradient(135deg, ${team.primary} 0%, ${team.secondary} 100%)`,
      }}
    >
      {team.shortName}
    </div>
  );
}
