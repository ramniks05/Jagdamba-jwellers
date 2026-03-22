# Jagdamba Jewellers

A showcase site for **Jagdamba Jewellers** — browse collections, filter by category, and send product enquiries via WhatsApp. No payment or checkout; focused on discovery and contact.

## Features

- **Home**: Main hero banner, category shortcuts, collection banners, featured products
- **Products**: Grid with category filter (sidebar / chips on mobile), sort (price, name, featured)
- **Product detail**: Image gallery or video, price, description, metal/weight; **Enquire on WhatsApp** (pre-filled message with product name, price, and link); **Share product link**
- **Mobile**: Responsive layout, tap-to-play product videos in grid, web app–friendly (standalone display, safe areas, theme color)
- **Theme**: Dark luxury palette (deep brown/black, gold accents, cream text) and elegant typography (Cormorant Garamond + Outfit)

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Build

```bash
npm run build
```

Output is in `dist/`. Serve that folder (e.g. Netlify, Vercel, or any static host).

## Data (dummy)

- `src/data/banners.json` — main banner + collection banners (title, subtitle, image, link)
- `src/data/categories.json` — categories (id, name, slug, image, productCount)
- `src/data/products.json` — products (id, name, slug, category, price, image, images[], videoUrl?, description, metal, weight, featured)

Replace with your API or CMS later; update the imports in the pages/components that use these files.

## WhatsApp

Set your business number in:

- `src/pages/ProductDetail.jsx` — `WHATSAPP_NUMBER` (e.g. `919876543210`, no +)
- `src/components/Footer.jsx` — `WHATSAPP_NUMBER`

Enquiry message includes product name, price, and current page URL.
