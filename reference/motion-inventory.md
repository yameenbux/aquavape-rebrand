# Motion inventory — live site

Every animation currently running on `aquavape.co.uk`, captured 2026-09-03.

## Libraries

| Library | Version | Loaded from | Used for |
|---|---|---|---|
| **Glide.js** | 3.7.1 | bundled into theme | Hero carousel, USP bar, collection sliders |
| **Lottie / bodymovin** | 5.7.4 | `cdnjs.cloudflare.com` | `.lottie-animation.product-info__banner--icon` |
| **MicroModal.js** | — | bundled into theme | Modal enter/exit |
| `IntersectionObserver` | native | `banner-grid.js` | Scroll-triggered reveal (hand-rolled) |

No GSAP, no ScrollTrigger, no AOS, no Lenis, no smooth-scroll library.

Glide is configured with `autoplay`, `rewind`, `hoverpause`, `perView`,
`breakpoints` — see `usp-bar.js` and `collection-slider.js`.

## Easing tokens

```
--ease-in       cubic-bezier(0.55,  0.055, 0.675, 0.19)
--ease-out      cubic-bezier(0.215, 0.61,  0.355, 1)
--ease-in-out   cubic-bezier(0.645, 0.045, 0.355, 1)
--ease-out-back cubic-bezier(0.34,  1.56,  0.64,  1)   <- overshoot
--bounce        cubic-bezier(0.175, 0.885, 0.32,  1.275) <- overshoot
--anim-time     0.3s
```

Two overshoot curves are defined. The motion language is *meant* to have
bounce in it — worth keeping and pushing further in the rebrand.

## Keyframes (theme.css)

| Name | Body | Where |
|---|---|---|
| `marquee-animate` | `translate(50%,-50%)` → `translate(-150%,-50%)`, opacity cut at 99.8% | Scrolling message bar; duration from `--section-animation-time` |
| `marquee` | 15s linear infinite | Legacy scrolling bar |
| `gradient-animation` | `background-position` 50% 0% → 50% 100% → 50% 0%, 15s ease-in-out infinite | Animated gradient backgrounds |
| `rotate` | `rotate(0)` → `rotate(360deg)`, 30s linear infinite | `.animated-bg .circle` behind rewards section |
| `anim` | Cycling `box-shadow` white → red → yellow → cyan → magenta, 4s linear infinite | `.rewards__section` glow |
| `ping` | `scale(2)` + fade at 75%, 2s infinite | Notification pulse |
| `icon-spin` | `rotate(0)` → `rotate(360deg)`, 1s linear infinite | Loading spinners |
| `mmfadeIn` / `mmfadeOut` | opacity 0↔1, 0.3s | Modal backdrop |
| `mmslideIn` | `translateY(15%)` → `0` | Modal enter |
| `mmslideOut` | `translateY(0)` → `-10%` | Modal exit |

## Micro-interactions

Transitions cluster in the **0.12s–0.3s** band:

- Buttons animate a `::before` sliding fill — `transform: translate(0)` on hover
  (`.btn--reverse:hover:before`)
- Product cards scale a pseudo-element — `transform: translate(-50%,-50%) scale(1)`
- Standard property transitions: `opacity 0.15s`, `border-color 0.15s ease-in-out`,
  `transform 0.12s ease-in-out`, `height 0.3s`, `0.3s cubic-bezier(0.4,0,0.2,1)`

## Accessibility gap

`theme.css` contains **no `prefers-reduced-motion` block**. The only
reduced-motion handling on the page comes from third-party stylesheets
(Klaviyo, Shopify checkout).

Currently unguarded and running permanently for every visitor:

- `marquee-animate` — infinite horizontal scroll
- `gradient-animation` — 15s infinite loop
- `rotate` — 30s infinite loop
- `anim` — 4s infinite colour-cycling glow
- `ping` — 2s infinite pulse

For a UK retailer this is a WCAG 2.2 / EN 301 549 exposure. It is also a
genuinely cheap fix — one media block:

```css
@media (prefers-reduced-motion: reduce) {
  .site-usp, .marquee-container, .animated-bg .circle,
  [class*="animated"], .ping {
    animation: none !important;
  }
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```
