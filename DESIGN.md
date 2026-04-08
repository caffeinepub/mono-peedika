# Design Brief — Mono-peedika

## Purpose & Context
Premium dark-mode e-commerce store focused on product discovery and trust. Mobile-first design for on-the-go shopping with sticky navigation and prominent product presentation.

## Tone
Professional minimalism — high polish, reduced decoration, emphasis on product imagery and information hierarchy. Inspired by premium tech retail (Apple, Nothing, Stripe).

## Color Palette — OKLCH

| Token | Purpose | L | C | H |
|-------|---------|---|---|---|
| **primary** | Warm orange for CTAs, cart actions | 0.65 | 0.2 | 29 |
| **accent** | Deal badges, highlights, "Best Sellers" | 0.68 | 0.18 | 55 |
| **background** | Deep charcoal immersion | 0.12 | 0 | 0 |
| **card** | Product card surfaces, elevated from bg | 0.16 | 0 | 0 |
| **foreground** | High-contrast text for readability | 0.96 | 0 | 0 |
| **muted** | Secondary text, less prominent info | 0.19 | 0 | 0 |
| **border** | Subtle card edges, input outlines | 0.24 | 0 | 0 |
| **destructive** | Red for cart removal, cancel | 0.65 | 0.19 | 22 |

## Typography

| Layer | Font | Use |
|-------|------|-----|
| Display | Space Grotesk 700 | Headlines, product names, section titles |
| Body | Figtree 400/500 | Product descriptions, metadata, labels |
| Mono | Geist Mono 400 | Price tags, UTR ID entry, order numbers |

## Structural Zones

| Zone | Treatment | Notes |
|------|-----------|-------|
| **Header** | `bg-card` + `border-b border-border/30` + sticky positioning | Logo, search, cart, auth in one line |
| **Hero Banner** | `bg-muted/30` with subtle gradient, product image overlay | Feature product or category promo |
| **Product Grid** | `gap-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4` | Cards use `.card-product` utility |
| **Section Divider** | `py-8 border-t border-border/20` | Space and subtle line between Best Sellers, Deals, All Products |
| **Footer** | `bg-muted/20` + `border-t border-border/20` | Links, contact, copyright |

## Component Patterns

| Component | Pattern |
|-----------|---------|
| **Product Card** | Image → Badge (if featured) → Name → Stars + Reviews → Price (₹) + CTA |
| **Price Display** | `font-mono text-lg font-semibold` with ₹ prefix |
| **Badge (Best Seller/Deal)** | `.badge-accent` utility — warm background, dark text, rounded-full |
| **CTA Buttons** | `bg-primary text-primary-foreground rounded-md px-4 py-2.5 transition-smooth hover:shadow-elevated` |
| **Input Fields** | `bg-input border border-border/50 text-foreground rounded-md px-3 py-2 focus:border-primary focus:ring-1 ring-primary/20` |

## Motion & Animation

- **Entrance:** `animate-fade-in` on product cards (0.3s ease-out)
- **Interaction:** `transition-smooth` on all interactive elements (0.3s cubic-bezier)
- **Hover:** Card elevation shadow, border accent highlight, product image zoom (subtle scale)
- **Badge Float:** `.animate-float` on "Best Seller" badges (3s loop) for subtle attention

## Spacing & Rhythm

- **Dense sections:** `gap-3` for product grids on mobile, `gap-4` on tablet+
- **Vertical rhythm:** `py-6 md:py-12` for major sections
- **Content padding:** `px-4 md:px-6 lg:px-8` for container sections
- **Card padding:** `p-3 md:p-4` for product cards

## Responsive Strategy

- **Mobile first:** `sm:` breakpoint (640px), `md:` (768px), `lg:` (1024px)
- **Grid:** 2 columns on mobile → 3 on tablet → 4 on desktop
- **Typography:** `text-base` body on mobile, `text-sm` labels, `text-xl` headers
- **Header:** Hamburger menu on `sm:`, full nav on `lg:`

## Differentiation & Signature Detail

**Warm accent on product edges:** Instead of flat product cards, use `border-l-2` or `border-b-2` in accent color on hover to signal interactivity while keeping clutter minimal. The warm orange accent (`hsl(55, 100%, 50%)` equivalent) ties to "premium sale" psychology — visible only on hover/focus to preserve the minimal aesthetic.

**Monospace price typography:** Price display in `Geist Mono` reinforces tech-forward e-commerce positioning and adds subtle visual hierarchy separate from product names.

## Constraints

- No gradients on backgrounds — depth via layering and shadows only
- No custom illustrations — product photography is the hero
- No animations on page load — only on user interaction
- Max 3 colors active simultaneously in any view (bg, foreground, accent)
- Badge accent reserved for featured products and deals only

---

*Dark mode enabled by default. Light mode not implemented. All colors tested for AA+ contrast.*
