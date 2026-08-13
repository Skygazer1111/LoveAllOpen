# LoveAll Open Badminton Tournament 2026

Official website for the **LoveAll Open Badminton Tournament 2026**, a beginner-level badminton tournament held on **16th August 2026** at Toneup Badminton, Thoraipakkam, Chennai.

## Features

- **Countdown** to tournament morning (16 August, 9:00 AM IST)
- **Event details** — venue, timings, shuttles, courts, and embedded Google Maps
- **Live fixtures** — all matches with times and courts; referee picks winners; knockout winners advance
- **Admin dashboard** — password-protected panel at `/#/admin` to manage players, groups, times, and results
- **WhatsApp contact** — serverless redirect so organiser phone numbers stay private
- **Instagram** — follow [@loveall_badminton](https://www.instagram.com/loveall_badminton?utm_source=qr)
- **Privacy Policy & Terms of Use** pages
- **Responsive design** — desktop and mobile, with scroll-reveal motion

## Categories

| Category | Type |
|---|---|
| Men's Singles | Singles |
| Men's Doubles | Doubles |
| Mixed Doubles | Doubles |

## Tech Stack

- **Vanilla JavaScript** — no frameworks, single-page app with hash-based routing
- **Vite** — dev server and production bundler
- **CSS custom properties** — theming, responsive design, flip-clock animations
- **Vercel** — hosting, WhatsApp redirect, and live fixture sync
- **localStorage + live board** — admin publishes results; the fixtures page polls for updates

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
│   ├── admin/page.js        # Admin dashboard
│   ├── home/
│   │   ├── page.js          # Homepage
│   │   ├── countdown.js     # Flip-clock countdown timer
│   │   └── maps.js          # Google Maps URL helpers
│   ├── legal/page.js        # Privacy & Terms pages
│   └── schedule/page.js     # Fixtures & schedule page
├── styles/index.css         # All styles
└── ui/
    ├── motion.js            # Scroll-reveal & parallax animations
    ├── feedback/modal.js    # Modal dialogs
    ├── layout/
    │   ├── navbar.js        # Navigation bar
    │   └── footer.js        # Footer with legal links
    └── tournament/
        ├── match-card.js    # Match card component
        ├── group-table.js   # Group standings table
        └── bracket.js       # Knockout bracket view
api/
├── wa/priyan.js             # Vercel serverless WhatsApp redirect
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

This is used by the Vercel serverless function and the local dev proxy to redirect WhatsApp contact links.

For **live fixtures on Vercel** (so phones see referee updates), create a KV store in the Vercel project (Storage → KV). Vercel then injects `KV_REST_API_URL` and `KV_REST_API_TOKEN`. Locally, admin publishes to `data/tournament.json` automatically.

## Running a match day

1. Open `/#/admin` and log in
2. Add players, generate groups, then **Set times & courts**
3. Tap **Set live** when a match starts
4. Tap **Pick winner** — scores are optional; knockout winners move to the next round
5. Players watch `/#/schedule` for live updates

## Deployment

The site is deployed on **Vercel**. Push to the `main` branch to trigger a build. Set `WA_PRIYAN` and (for the live board) connect a Vercel KV store.

## License

Private project — all rights reserved.
