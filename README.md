# Photography

My photo gallery: shots from my phone, friends' phones, and whatever camera I can borrow, edited in Lightroom.

**Live:** [photography-website-ebon.vercel.app](https://photography-website-ebon.vercel.app)

## What's on it

- **Swipe view** (`/swipe`) that feels like flipping through a phone's camera roll. Swipe down to filter by landscape or portrait.
- **Before and after.** Swipe up on a photo to see the unedited original next to the Lightroom edit.
- **Gallery grid** (`/photos`) that labels each shot with the phone or camera that took it. Tap one to open it larger with its title and place.
- **Installs like an app.** It's a progressive web app with an offline cache, so it can live on a phone's home screen.

## How photos are organized

Each photo lives in its own folder under `public/photos/`, named `NNN - YYYY-MM-DD - Place`, holding:

- `edited.jpg`: the version shown on the site
- `raw.jpg`: the unedited original, for the before-and-after view

Titles, locations, dates, and which photos are hidden are kept in [`data/photos.json`](data/photos.json). The camera model and orientation are read from each photo's EXIF data. The gallery's title and intro text are in [`data/content.json`](data/content.json).

## Editing photo details

Run the site locally and open `/admin` to edit each photo's title and location, hide it, feature it, or change its order. Saving updates `data/photos.json`, renames the photo's folder to match, and writes the title and location into the image's metadata. Commit the changes to publish them.

## Built with

Next.js 16 (App Router) · React 19 · TypeScript · CSS Modules · sharp and exiftool for image metadata · Vercel Analytics · deployed on Vercel

## Run it locally

Use Node.js 20 or newer.

```sh
npm ci
npm run dev
```

Then open http://localhost:3000.
