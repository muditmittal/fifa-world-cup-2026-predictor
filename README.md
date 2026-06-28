# FIFA World Cup 2026 — Bracket Predictor

An interactive knockout bracket predictor for the FIFA World Cup 2026 (USA, Mexico, Canada).

## Features

- **Full 32-team knockout bracket** — All Round of 32 matchups populated from actual group stage results
- **Click to predict** — Pick winners for each match; selections cascade through the bracket
- **Real results sync** — Pull actual match results to compare against your predictions
- **Visual feedback** — Green (correct), Red (incorrect), Amber (needs re-evaluation)
- **Smart cascading** — Changing an early pick clears downstream picks involving that team
- **Re-evaluation alerts** — When a real result invalidates your downstream picks, those matches get flagged (amber) without being auto-changed
- **Two views** — Full bracket visualization or a mobile-friendly round-by-round list
- **Local persistence** — Picks saved to localStorage

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Updating Real Results

Edit `lib/actual-results.ts` to add match outcomes as they happen:

```typescript
export const actualResults: ActualResult[] = [
  { matchId: 73, winner: "CAN", score: "2-1" },
  { matchId: 74, winner: "GER", score: "3-0" },
  // ... add more as matches conclude
];
```

Then click **Sync Results** in the UI to pull them in.

## Match ID Reference

| IDs | Round |
|-----|-------|
| 73–88 | Round of 32 |
| 89–96 | Round of 16 |
| 97–100 | Quarter-Finals |
| 101–102 | Semi-Finals |
| 103 | Final |
| 104 | 3rd Place |

## Tech Stack

- Next.js 16 (App Router)
- React 19
- Tailwind CSS 4
- TypeScript
- localStorage for state persistence
