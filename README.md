# WowFolio Studio

Rebuilt from the original `rammcodes/WowFolio` template into a small full-stack portfolio app.

## What Changed

- Static content was replaced with API-driven content rendering.
- A Node/Express backend now serves the site and persists data to JSON.
- An admin studio at `/admin` lets you edit:
  - site copy
  - hero, about, skills, and contact sections
  - social links
  - theme colors
  - project entries
- Contact form submissions are stored and shown in the admin inbox.

## Stack

- Node.js
- Express
- Vanilla HTML, CSS, and JavaScript
- JSON file persistence

## Run Locally

```bash
npm install
npm start
```

The app runs at:

- Public site: `http://127.0.0.1:4174/`
- Admin studio: `http://127.0.0.1:4174/admin`

## Data Files

- Site content: [`data/site-content.json`](./data/site-content.json)
- Contact submissions: [`data/submissions.json`](./data/submissions.json)

These files are updated by the backend and admin studio.

## Available Scripts

- `npm start`: run the production server
- `npm run dev`: run the server in watch mode

## Notes

- There is no authentication on `/admin`. That is fine for local use, but if you deploy this publicly you should add auth before exposing it.
- Project images currently use the bundled [`assets/mock.png`](./assets/mock.png) placeholder by default. You can point project entries to other image paths from the admin studio.
