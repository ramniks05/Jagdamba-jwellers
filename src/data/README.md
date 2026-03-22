# Where to update image & banner URLs

Replace the URLs in these files with your own when you are ready. The app reads all images from here.

## 1. Main banner & collection banners  
**File:** `banners.json`

| What to update | Field |
|----------------|--------|
| Home page hero image | `mainBanner.image` |
| Each collection card image (Rings, Necklaces, etc.) | `collectionBanners[].image` |

---

## 2. Category images  
**File:** `categories.json`

| What to update | Field |
|----------------|--------|
| Image for each category (Rings, Necklaces, Earrings, etc.) | Each object’s `image` |

---

## 3. Product images  
**File:** `products.json`

| What to update | Field |
|----------------|--------|
| Main product image (listing & detail) | Each product’s `image` |
| Extra images on product detail page | Each product’s `images` (array of URLs) |

You can use any full image URL (e.g. your CDN, cloud storage, or CMS).  
Right now Unsplash URLs are used as placeholders; replace them with your own when ready.

---

## 4. Footer – address & contact  
**File:** `site.json` → `footer`

| What to update | Field |
|----------------|--------|
| Tagline under logo | `footer.tagline` |
| Primary menu links | `footer.primaryMenu[]` (label, path) |
| Store address | `footer.contact.address` |
| Email | `footer.contact.email` |
| Mobile number | `footer.contact.mobile` |
| WhatsApp number (no + or spaces) | `footer.contact.whatsappNumber` |
