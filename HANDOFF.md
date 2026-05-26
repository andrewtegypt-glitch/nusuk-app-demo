# Nusuk App Demo — Handoff

Static HTML / CSS / vanilla JS prototype of a family financial literacy mobile app. No build step, no external libraries except a single Fontshare CSS import for the Satoshi typeface (with a system fallback stack).

## File map

| Path | Purpose |
|------|---------|
| `index.html` | Single page. Holds both Child and Parent app views, all tab panes, status bar, bottom nav. |
| `styles.css` | All design tokens (navy/amber palette), phone frame, screens, components. |
| `app.js` | View toggle, bottom-nav tab switching, small click feedback. ~80 lines. |
| `qa-*.png` | Playwright QA screenshots (desktop + mobile). Safe to delete; left in place for reference. |

Deploy with `deploy_website(project_path="nusuk-app-demo")`. Entry point is `index.html`.

## Design decisions

- **Brand palette** — navy (`--navy-900` `#0a1a3a` → `--navy-500`) + amber accent (`--amber-400` `#ffc863` → `--amber-600`). Secondary data colors: blue, green, purple, rose — kept restrained.
- **Typography** — Satoshi loaded via Fontshare CDN (preferred over Google Fonts), system sans fallback. Sizes range 10px caption → 22px header. Weights 400 / 500 / 700 / 800.
- **Phone frame** — pure CSS. Width 372px, height `min(760px, 100svh - 200px)` so it always fits the desktop viewport without page scroll, with a `640px` floor. Dynamic island notch, volume/power side buttons, home indicator.
- **Status bar** — fixed iconic `9:41` time (intentional Apple convention) + custom inline SVG wifi/cellular/battery glyphs. Pinned to the top of each app view so the colored header reads behind it.
- **Layout** — each app view is a flex column: `header → .scroll-area → .bottom-nav`. Only `.scroll-area` scrolls. Bottom nav stays anchored inside the phone.
- **Tab panes** — every bottom-nav button corresponds to a `data-pane` inside `.scroll-area`. Switching toggles `.is-active`, with a small fade/translate animation. Scroll position resets on switch.
- **Accessibility** — `role="tablist"` + `role="tab"` on view toggles, arrow-key support, `aria-selected`, `aria-current="page"` on active nav button, `role="progressbar"` with `aria-valuenow` on bars, focus-visible amber ring, `prefers-reduced-motion` disables animations.
- **Custom SVG logo** — inline navy/amber "N" inside a rounded square. Also used as the favicon (embedded `data:` URL, no extra file).

## Content inventory

### Child view (`#view-child`)
- **Header**: "Hi, Youssef" 👋, age 12, Level 5, XP bar at 62% (1,240 XP), 7-day streak amber badge.
- **Home pane** (`data-pane="child-home"`): My Goals (University fund 34% / First laptop 72% / Eid savings 18%); Lessons (Compounding Interest blue card / Inflation green card); My Badges (4 tiles in 2×2 — First saver, Goal getter, Smart spender, Quick learner).
- **Goals pane**: 3 expanded goal cards with target dates.
- **Learn pane**: 3 lesson cards (extra "How banks work" amber card).
- **Rewards pane**: 3 reward cards, last one claimable.
- **Bottom nav**: Home / Goals / Learn / Rewards.

### Parent view (`#view-parent`)
- **Header**: "Good morning, Fatima" + 3 summary boxes (3 Children / 5 Goals / $4,200 Saved, last styled amber).
- **Dashboard pane**: Recent Contributions feed (Ahmed +$150, Grandma Aisha +$50, Youssef +$20, Fatima +$200), Active Goals with Add goal button.
- **Goals pane**: 3 expanded goal cards.
- **Family pane**: 5 members — Fatima, Ahmed, Youssef, Layla, Grandma Aisha with roles and contribution totals.
- **Settings pane**: 6 rows (Notifications, Auto-deposit, Linked bank, Permissions, Language, Sign out).
- **Bottom nav**: Dashboard / Goals / Family / Settings.

## Follow-up conventions (for incremental edits)

- **Add a new goal** → drop a new `<article class="goal-card">` inside the relevant `.goal-list`. Use `progress--blue / amber / green` modifier and `width:X%` on `.progress-fill` and matching `aria-valuenow`.
- **Add a new badge** → append a `<div class="badge-tile">` with a `badge-icon badge-icon--gold/blue/green/purple` gradient class.
- **Add a new tab** → add a `<button class="nav-btn" data-tab="newtab">` in the right `.bottom-nav`, and a matching `<div class="tab-pane" data-pane="newtab">` inside the same `.scroll-area`. JS auto-wires both.
- **Add a new view** → not anticipated, but: duplicate an `.app-view` section, give it a unique id and a matching toggle button with `data-view="..."`. JS only knows the two existing keys (`child`, `parent`); extend the `views` map in `app.js` to support more.
- **Color tweaks** — change the `--navy-*` or `--amber-*` tokens at the top of `styles.css`. All gradients are derived from them.
- **Text edits** — pure markup; no template engine.

## Known minor items

- Lesson "Start", Reward "Claim", "Add goal", and "See all" buttons have a press animation but no navigation (intentionally — it's a mockup). Wire to real flows when productionizing.
- Status bar shows fixed `9:41`. A live clock helper is stubbed but disabled in `app.js`.
- Family tab in parent view shows 5 members although the summary box says "3 Children" — `Fatima` + `Ahmed` + 3 children + 1 contributor (Grandma) = 5 members, which is consistent with the spec.

## QA evidence

Screenshots in repo root:
- `qa-child-v2.png` — Child Home view at 1280×900 desktop.
- `qa-parent-dashboard.png` — Parent Dashboard.
- `qa-parent-family.png` — Parent Family pane (5 members).
- `qa-rewards-v2.png` — Child Rewards pane with bottom nav active state.
- `qa-mobile.png` — 390×844 mobile viewport.

All interactions verified via Playwright: view toggle, every bottom-nav tab, scroll behavior.
