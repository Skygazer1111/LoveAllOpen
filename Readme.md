# LoveAll Open Badminton Tournament 2026

Official website for the **LoveAll Open Badminton Tournament 2026**, a beginner-level badminton tournament held on **16th August 2026** at Toneup Badminton, Thoraipakkam, Chennai.

## Features

- **Countdown** to tournament morning (16 August, 9:00 AM IST)
- **Event details** — venue, timings, shuttles, courts, and embedded Google Maps
- **Live fixtures board** — match times, courts, live/upcoming/completed bands, group standings, and knockout bracket
- **Referee controls** — set matches live, pick winners (scores optional); knockout winners advance automatically
- **Admin dashboard** — password-protected panel at `/#/admin` for players, pairs, groups, schedules, and results
- **Export PDF** — download participant tables by category (and groups, if generated)
- **Import Excel** — upload the fixture spreadsheet to create players, groups, and matches
- **WhatsApp contact** — serverless redirect; organiser phone numbers stay off the public site
- **Instagram** — follow [@loveall_badminton](https://www.instagram.com/loveall_badminton?utm_source=qr)
- **Privacy Policy & Terms of Use** — `/#/privacy` and `/#/terms`
- **Responsive design** — desktop and mobile, with scroll-reveal motion

## Categories

| Category | Entry |
|---|---|
| Men's Singles | Player name |
| Men's Doubles | Player 1 & Player 2 (no team name) |
| Mixed Doubles | Player 1 & Player 2 (no team name) |

## Tech Stack

- **Vanilla JavaScript** — single-page app with hash-based routing
- **Vite** — dev server and production bundler
- **jsPDF + autotable** — participant PDF export
- **CSS custom properties** — athletic club theme and responsive layout
- **Vercel** — hosting, WhatsApp redirect (`/api/wa/priyan`), live board API (`/api/tournament`)
- **localStorage + live board** — admin publishes; public fixtures poll for updates

## Project Structure

```
src/
├── main.js                  # Entry point & router wiring
├── app/router.js            # Hash-based SPA router
├── data/
│   ├── defaults.js          # Default tournament seed data
│   ├── store.js             # Tournament data + match advancement
│   └── sync.js              # Publish / pull live fixtures
├── features/
│   ├── admin/
│   │   ├── page.js          # Admin dashboard
│   │   └── export-pdf.js    # Participants PDF export
│   ├── home/
│   │   ├── page.js          # Homepage
│   │   ├── countdown.js     # Countdown timer
│   │   └── maps.js          # Google Maps URL helpers
│   ├── legal/page.js        # Privacy & Terms pages
│   └── schedule/page.js     # Fixtures & schedule page
├── styles/index.css         # All styles
└── ui/
    ├── motion.js            # Scroll-reveal & parallax animations
    ├── feedback/modal.js    # Modal dialogs
    ├── layout/
    │   ├── navbar.js        # Navigation bar
    │   └── footer.js        # Footer (legal + Instagram)
    └── tournament/
        ├── match-card.js    # Match card component
        ├── group-table.js   # Group standings table
        └── bracket.js       # Knockout bracket view
api/
├── wa/priyan.js             # WhatsApp redirect
└── tournament.js            # Live fixture board (GET / PUT)
```

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Production build
npm run build
```

## Environment Variables

Create a `.env` file in the project root:

```
WA_PRIYAN=91XXXXXXXXXX
```

Used by the Vercel serverless function and the local Vite proxy for WhatsApp redirects.

For **live fixtures on Vercel** (so every phone sees the same draw) use **free Upstash Redis** — do **not** buy Vercel Storage plans:

1. Open [console.upstash.com](https://console.upstash.com) and sign up (free)
2. **Create → Redis Database** → pick the **Free** plan
3. Open the DB → **REST API** → copy `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`
4. In Vercel → **Settings → Environment Variables**, add both, then **Redeploy**
5. In Admin, click **Publish schedule** — status should say the schedule is live

Locally, publish writes `data/tournament.json` and `public/live-board.json`. Optional: `ADMIN_SYNC_SECRET` overrides the publish key (defaults to the admin password).

## Running a match day

1. Open `/#/admin` and log in
2. Add players (singles) or pairs (doubles / mixed) — no team names
3. Generate groups, then **Set times & courts**
4. Tap **Set live** when a match starts
5. Tap **Pick winner** — scores are optional; knockout winners move on automatically
6. Use **Export PDF** for a printable participants list by category
7. Spectators watch `/#/schedule` for live updates

## Deployment

Deployed on **Vercel**. Push to `main` to build. Set `WA_PRIYAN`, and add the free Upstash Redis REST URL + token for the shared live board.

## License

Private project — all rights reserved.
