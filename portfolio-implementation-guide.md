# 🎨 Designer Portfolio — Agentic Implementation Guide

> One-page portfolio + Work gallery page for a digital illustrator/designer.
> Built with Angular 18+, hosted on GitHub Pages.

---

## Design Tokens (Reference These Throughout)

```
Colors:
  --bg-base:       #092328   (near-black teal — page background)
  --bg-surface:    #12544F   (card/section backgrounds)
  --accent:        #2A835F   (primary interactive / highlights)
  --accent-light:  #8BBB92   (softer accent, hover states)
  --text-primary:  #E8EDE9   (near-white body text)
  --text-muted:    #7A9E85   (labels, captions)

Typography:
  Display / Headings: "Cormorant Garamond" (Google Fonts) — elegant, editorial
  Body / UI:          "DM Sans" (Google Fonts) — clean, modern, readable
  Monospace accents:  "DM Mono" — for small labels only

Motion rule: one orchestrated moment per section reveal (IntersectionObserver),
             no scattered hover animations everywhere.
```

---

## Phase 1 — Project Bootstrap

### Step 1: Create the Angular project

```bash
ng new portfolio --routing=true --style=scss --standalone=false
cd portfolio
```

When prompted:
- **Routing**: Yes
- **Stylesheet format**: SCSS

---

### Step 2: Install dependencies

```bash
# Animations & scroll
npm install @angular/animations

# Icon set (for UI icons, social links)
npm install lucide-angular

# Email form (EmailJS — no backend needed)
npm install @emailjs/browser

# Image lightbox/viewer for Work page
npm install yet-another-react-lightbox   # ← skip this, use Angular-native instead:
npm install ng-gallery                   # Angular image lightbox

# SEO
# Angular's built-in Meta + Title services (no extra install needed)
```

---

### Step 3: Set up folder structure

Ask the agent to create this exact structure:

```
src/
└── app/
    ├── core/
    │   └── services/
    │       ├── scroll.service.ts         # smooth scroll, active section tracking
    │       ├── cursor.service.ts         # pen cursor trail logic
    │       ├── email.service.ts          # EmailJS integration
    │       └── seo.service.ts            # Meta/Title per page/section
    │
    ├── domain/
    │   ├── const/
    │   │   ├── nav-items.const.ts        # navigation link definitions
    │   │   ├── services.const.ts         # "How I Can Help" card data
    │   │   ├── technologies.const.ts     # Figma, AI, Photoshop etc.
    │   │   └── social-links.const.ts
    │   └── interfaces/
    │       ├── artwork.interface.ts      # id, title, category, src, thumb, description
    │       ├── service-card.interface.ts
    │       └── nav-item.interface.ts
    │
    ├── pages/
    │   ├── home/
    │   │   ├── home.component.ts
    │   │   ├── home.component.html
    │   │   └── home.component.scss
    │   └── work/
    │       ├── work.component.ts
    │       ├── work.component.html
    │       └── work.component.scss
    │
    └── shared/
        ├── components/
        │   ├── navbar/
        │   ├── footer/
        │   ├── pen-cursor/               # the trailing pen cursor
        │   ├── section-reveal/           # IntersectionObserver wrapper
        │   ├── artwork-card/             # thumbnail card used in grid
        │   ├── image-viewer/             # lightbox modal for Work page
        │   ├── skill-badge/              # Figma / PS / AI badges
        │   └── contact-form/
        └── pipes/
            └── truncate.pipe.ts

src/
└── assets/
    ├── images/
    │   ├── artworks/                     # full-res illustrations
    │   ├── thumbnails/                   # compressed thumbs (WebP)
    │   ├── featured/                     # 3–5 hero featured works
    │   └── about/                        # portrait, background textures
    └── fonts/                            # if self-hosting (optional)
```

---

## Phase 2 — Routing Setup

### Step 4: Configure app routes

In `app-routing.module.ts`:

```typescript
const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    title: 'Your Name — Digital Illustrator & Designer'
  },
  {
    path: 'work',
    loadComponent: () => import('./pages/work/work.component')
      .then(m => m.WorkComponent),
    title: 'Work — Your Name'
  },
  { path: '**', redirectTo: '' }
];
```

> Use lazy loading on the Work page — it loads image-heavy content.

---

## Phase 3 — Core Services

### Step 5: Scroll service

`core/services/scroll.service.ts`

```typescript
// Responsibilities:
// 1. Smooth scroll to section by ID (used by navbar links)
// 2. Track which section is currently in view (for navbar active state)
// 3. Expose activeSection$ as Observable<string>

// Implementation hint for agent:
// Use fromEvent(window, 'scroll') + debounceTime(50)
// Check each section's getBoundingClientRect() to find active one
```

### Step 6: Cursor service

`core/services/cursor.service.ts`

```typescript
// Responsibilities:
// 1. Track mouse position on mousemove
// 2. Render a small SVG pen nib that follows the cursor with slight lag
// 3. Leave a short ~1cm line trail that fades out in ~400ms
// 4. Disable on touch devices

// Implementation approach for agent:
// - Use a Canvas overlay (position:fixed, pointer-events:none, z-index:9999)
// - On each mousemove, draw a short line segment from last position to current
// - Store trail points in a circular buffer (last ~12 points)
// - Use requestAnimationFrame to redraw + fade out older points
// - The pen nib SVG icon follows cursor with a slight translate offset
```

### Step 7: SEO service

`core/services/seo.service.ts`

```typescript
// Use Angular's built-in Meta + Title services
// Methods:
// - setHomeMeta()
// - setWorkMeta()
// - updateForArtwork(artwork: Artwork)  ← for open graph when viewer opens

// Meta tags to set:
// og:title, og:description, og:image, twitter:card
// description, keywords (keep keywords minimal — max 8)
```

### Step 8: Email service

`core/services/email.service.ts`

```typescript
// Use EmailJS (emailjs.com — free tier: 200 emails/month)
// Setup:
// 1. Create account at emailjs.com
// 2. Add Email Service (Gmail works)
// 3. Create a template with {{from_name}}, {{from_email}}, {{message}}
// 4. Store SERVICE_ID, TEMPLATE_ID, PUBLIC_KEY in environment.ts

import emailjs from '@emailjs/browser';

sendMessage(form: ContactForm): Observable<void> {
  // call emailjs.send(...)
  // return Observable wrapping the Promise
}
```

---

## Phase 4 — Domain Layer

### Step 9: Define interfaces

`domain/interfaces/artwork.interface.ts`:
```typescript
export interface Artwork {
  id: string;
  title: string;
  category: 'illustration' | 'branding' | 'ui' | 'print';
  description: string;
  tags: string[];
  src: string;           // full resolution path
  thumbnail: string;     // compressed WebP thumb
  featured: boolean;     // show on homepage?
  year: number;
}
```

`domain/interfaces/service-card.interface.ts`:
```typescript
export interface ServiceCard {
  icon: string;          // lucide icon name
  title: string;
  description: string;
  highlight: string;     // short bold callout, e.g. "Starting from €X"
}
```

### Step 10: Populate constants

`domain/const/services.const.ts` — populate with the 3 value props:
```typescript
export const SERVICES: ServiceCard[] = [
  {
    icon: 'pen-tool',
    title: 'Digitalize Your Vision',
    description: 'Bring hand-drawn concepts or rough ideas into polished digital illustrations.',
    highlight: 'Sketch → Vector → Delivery'
  },
  {
    icon: 'sparkles',
    title: 'Human-Made in the Age of AI',
    description: 'Stand out with artwork that carries personality, craft, and intentionality — not generated output.',
    highlight: 'Distinctly yours'
  },
  {
    icon: 'layers',
    title: 'Brand Identity & Visual Systems',
    description: 'Logos, palettes, type pairings, and usage guides that give your brand a consistent face.',
    highlight: 'From concept to guidelines'
  }
];
```

---

## Phase 5 — Shared Components

### Step 11: Pen cursor component

`shared/components/pen-cursor/`

```
- Uses a fixed canvas overlay for the trail
- SVG pen nib follows mouse with requestAnimationFrame
- Trail: draw short line segments, reduce opacity each frame
- On mobile (touch): hide entirely
- Provide as a root-level component in app.component.html (always present)
```

### Step 12: Section reveal component

`shared/components/section-reveal/`

```typescript
// Wrapper component that adds reveal animation when section enters viewport
// Uses IntersectionObserver with threshold: 0.15
// Adds CSS class 'revealed' → trigger CSS transition (opacity + translateY)
// Inputs: direction ('up' | 'left' | 'right'), delay (ms)
// One clean entrance per section, not per-card scatter effect
```

### Step 13: Artwork card component

`shared/components/artwork-card/`

```
Inputs: artwork: Artwork
Output: clicked EventEmitter<Artwork>

Template:
- <figure> with aspect-ratio: 4/3
- <img> with loading="lazy" + skeleton placeholder (CSS shimmer)
- Skeleton shows while image loads (use (load) event to remove)
- Overlay on hover: title + category badge
- Emit clicked on click (parent handles lightbox open)
```

### Step 14: Image viewer (lightbox)

`shared/components/image-viewer/`

```
Inputs:  artworks: Artwork[], currentIndex: number, visible: boolean
Outputs: closed EventEmitter<void>, navigate EventEmitter<number>

Features:
- Full-screen overlay (position:fixed, backdrop blur)
- Left/right arrow navigation
- Keyboard: ArrowLeft, ArrowRight, Escape
- Swipe support (touch events) for mobile
- Show title + description below image
- Close on backdrop click
- Trap focus inside modal (accessibility)
- Animate open/close with opacity + scale
```

### Step 15: Contact form component

`shared/components/contact-form/`

```
Fields: Name, Email, Message, (optional) Project type dropdown
Validation: Angular Reactive Forms with validators
States: idle → submitting (show spinner) → success (thank you msg) → error

On submit: call EmailService.sendMessage()
Bonus: add honeypot field (hidden input) for basic spam protection
```

---

## Phase 6 — Home Page Sections

### Step 16: Build the home page

`pages/home/home.component.html` — compose these sections in order:

```html
<app-navbar />

<!-- SECTION 1: Landing / Hero -->
<section id="home">
  <!-- Full viewport height -->
  <!-- Large display name + title (Cormorant Garamond, very large) -->
  <!-- Subtitle: "Digital Illustrator · Visual Designer" -->
  <!-- Two CTAs: "See My Work" (scrolls to featured) + "Let's Talk" (scrolls to contact) -->
  <!-- Subtle background: low-opacity illustration texture or abstract shapes -->
  <!-- Availability badge: "● Available for projects" -->
</section>

<!-- SECTION 2: Featured Work -->
<section id="featured">
  <!-- Heading: "Selected Work" -->
  <!-- Grid of 3–5 featured artworks using <app-artwork-card> -->
  <!-- "View All Work →" button linking to /work -->
</section>

<!-- SECTION 3: My Story (About) -->
<section id="about">
  <!-- Left: portrait image or illustrated avatar -->
  <!-- Right: story text in 2–3 paragraphs -->
  <!-- Timeline with scrolling dot — see Step 17 -->
  <!-- Tech stack badges using <app-skill-badge> -->
  <!-- Tone: first person, warm, specific — "I've been drawing since..." -->
</section>

<!-- SECTION 4: Services -->
<section id="services">
  <!-- Heading: "How I Can Help" -->
  <!-- 3 service cards from SERVICES const -->
  <!-- Each: icon + title + description + highlight -->
</section>

<!-- SECTION 5: Contact -->
<section id="contact">
  <!-- Heading: "Let's Make Something" -->
  <!-- Left: short warm copy + social links (email, Instagram, Behance) -->
  <!-- Right: <app-contact-form> -->
</section>

<app-footer />
```

### Step 17: Scrolling timeline dot (About section)

```typescript
// In HomeComponent or a dedicated TimelineComponent:
// 1. Get the timeline container's top + height
// 2. On scroll, calculate progress = (scrollY - sectionTop) / sectionHeight
// 3. Clamp to [0, 1]
// 4. Set dot's top position = progress * timelineHeight via renderer
// 5. Use requestAnimationFrame for smooth update
// Timeline milestones: childhood sketching, first digital tools, 
//                      first client, current work — as static nodes
```

---

## Phase 7 — Work Page

### Step 18: Build the Work page

`pages/work/work.component.html`:

```
- Page header: "Work" in large display type
- Filter tabs: All | Illustration | Branding | UI | Print
  (filter the artworks array, animate grid changes)
- Masonry or uniform grid of <app-artwork-card> components
- All images lazy-loaded with skeleton shimmer
- On card click → open <app-image-viewer> lightbox
- Keyboard navigation supported in lightbox
```

```typescript
// WorkComponent:
// artworks: Artwork[] — full list from a constant or future API
// filteredArtworks: Artwork[] — reactive to selected filter
// viewerVisible: boolean
// viewerIndex: number

// Filter change → update filteredArtworks with animation
// (use Angular animations or a CSS class toggle for grid transitions)
```

---

## Phase 8 — Navbar

### Step 19: Navbar behavior

```
Desktop:
- Fixed top, transparent initially, gets bg-surface + blur on scroll
- Logo (name or monogram) left
- Nav links right: Home · Work · About · Services · Contact
- Active link highlighted based on scroll position (from ScrollService)
- "Let's Talk" CTA button (scrolls to contact)

Mobile:
- Hamburger menu → full-screen overlay nav
- Links close the menu on click
- Smooth open/close animation

All nav links on home page = smooth scroll to section ID
"Work" link = navigate to /work route
```

---

## Phase 9 — Performance & SEO

### Step 20: Image optimization

```
For each artwork:
1. Provide two versions: full-res (artworks/) + compressed WebP thumb (thumbnails/)
2. Use srcset on img tags for responsive images
3. All <img> get: loading="lazy" width height alt attributes
4. Above-the-fold images (hero, first featured): loading="eager"
```

### Step 21: SEO setup

In `index.html`:
```html
<meta name="description" content="[Name] — Digital Illustrator and Visual Designer. Human-made artwork, brand identity, and illustration work.">
<meta name="keywords" content="digital illustrator, designer, brand identity, illustration, Figma">
<meta property="og:image" content="assets/images/og-preview.jpg">
<meta property="og:type" content="website">
<link rel="canonical" href="https://yourdomain.com">
```

Use `SeoService` to update title + og:image when image viewer opens.

---

## Phase 10 — GitHub Pages Deploy

### Step 22: Configure for GitHub Pages

```bash
# Install deploy tool
ng add angular-cli-ghpages

# In angular.json, set outputPath to "docs"
# Set baseHref to your repo name

ng build --base-href /your-repo-name/

# Deploy
npx angular-cli-ghpages --dir=dist/portfolio/browser
```

In `app-routing.module.ts`, add the 404 redirect workaround:
```typescript
// Add a 404.html to src/ that copies index.html for GitHub Pages routing
// (Angular Router handles the rest)
```

---

## Implementation Order for the Agent

Feed these as sequential tasks:

1. `Create Angular project with routing and SCSS`
2. `Create the full folder structure as defined`
3. `Define all interfaces in domain/interfaces/`
4. `Populate all constants in domain/const/`
5. `Implement ScrollService + CursorService`
6. `Implement EmailService with EmailJS`
7. `Implement SeoService`
8. `Build PenCursorComponent (canvas trail)`
9. `Build SectionRevealComponent (IntersectionObserver)`
10. `Build ArtworkCardComponent with skeleton loading`
11. `Build ImageViewerComponent (lightbox)`
12. `Build ContactFormComponent with validation`
13. `Build NavbarComponent with scroll-aware active state`
14. `Build FooterComponent`
15. `Build Home page — all 5 sections`
16. `Build Work page with filter tabs and grid`
17. `Set up routing (lazy load Work page)`
18. `Apply global SCSS variables, typography, reset`
19. `Add SEO meta tags`
20. `Configure and test GitHub Pages deploy`

---

## Global SCSS Setup

`styles.scss` should define:

```scss
:root {
  --bg-base:       #092328;
  --bg-surface:    #12544F;
  --accent:        #2A835F;
  --accent-light:  #8BBB92;
  --text-primary:  #E8EDE9;
  --text-muted:    #7A9E85;
  
  --font-display: 'Cormorant Garamond', Georgia, serif;
  --font-body:    'DM Sans', system-ui, sans-serif;
  --font-mono:    'DM Mono', monospace;

  --radius-sm: 4px;
  --radius-md: 10px;
  --radius-lg: 20px;

  --transition-base: 200ms ease;
  --transition-slow: 400ms cubic-bezier(0.4, 0, 0.2, 1);
}

* { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; }
body {
  background: var(--bg-base);
  color: var(--text-primary);
  font-family: var(--font-body);
  -webkit-font-smoothing: antialiased;
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```
