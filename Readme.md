# LoveAll Open Badminton Tournament 2026

Official website for the **LoveAll Open Badminton Tournament 2026**, a beginner-level badminton tournament held on **16th August 2026** at Toneup Badminton, Thoraipakkam, Chennai.

## Features

- **Live flip-clock countdown** to tournament day with a 3D card-flip animation
- **Event details** — venue, timings, shuttles, courts, and embedded Google Maps
- **Match fixtures & schedule** — group tables, knockout brackets, and match cards
- **Admin dashboard** — password-protected panel to manage fixtures, categories, and event settings (accessible via `/#/admin`)
- **WhatsApp contact** — serverless redirect so organiser phone numbers stay private
- **Privacy Policy & Terms of Use** pages
- **Responsive design** — optimised for both desktop and mobile with scroll-reveal animations and parallax motion

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
- **Vercel** — hosting and serverless functions (WhatsApp redirect)
- **localStorage** — client-side persistence for tournament data

## Project Structure

```
src/
├── main.js                  # Entry point & router wiring
├── app/router.js            # Hash-based SPA router
├── data/
│   ├── defaults.js          # Default tournament seed data
│   └── store.js             # localStorage-backed data store
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
└── wa/priyan.js             # Vercel serverless WhatsApp redirect
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

## Deployment

The site is deployed on **Vercel**. Push to the `main` branch to trigger a build. Make sure the `WA_PRIYAN` environment variable is set in Vercel project settings.

## License

Private project — all rights reserved.
