# DESIGN.md

Visual and UX design guidelines for the Vindicta desktop app.

## Design Philosophy

- **Dark-first**: The UI is optimized for dark mode. Light mode is supported but secondary.
- **Glass + depth**: Cards use translucent glass aesthetics with subtle borders, not solid fills.
- **Compact & operational**: This is a professional tool — every pixel should earn its place. No marketing fluff in the app UI.
- **No framework fingerprints**: Never expose Tauri, WebView, Electron, or any underlying tech in user-facing copy or UI labels.

---

## Color System

All colors are driven by CSS variables defined in `apps/desktop/assets/css/main.css`. Always use variables — never hard-code Tailwind color utilities for backgrounds or text in contexts where theme switching matters.

### Background layers

| Variable | Purpose |
|----------|---------|
| `var(--bg-base)` | Page background (outermost layer) |
| `var(--bg-surface)` | Panels, sidebars, secondary surfaces |
| `var(--bg-card)` | Cards and elevated containers |

### Text

| Variable | Use |
|----------|-----|
| `var(--text)` | Primary — headings, important labels |
| `var(--text-muted)` | Secondary — body text, descriptions |
| `var(--text-faint)` | Tertiary — timestamps, placeholders, disabled |

### Border

| Variable | Use |
|----------|-----|
| `var(--border)` | Default border between elements |

### Feature Accent Colors

Each major feature area has a consistent accent. Use the matching Tailwind palette for all states (borders, backgrounds, text, icons).

| Feature | Color | Example usage |
|---------|-------|---------------|
| Academy / AI professor | `indigo-500` | Chat bubbles, session headers |
| Whiteboard / TTS / Audio | `teal-500` | Whiteboard border, audio player |
| Claude / Anthropic | `violet-500` | Model badges, Claude buttons |
| Codex / OpenAI | `emerald-500` | Codex status, suggested badges |
| OpenRouter | `sky-500` | OpenRouter card, model selector |
| Ollama (local AI) | `orange-500` | Ollama card, Ollama option |
| Success / verified | `emerald-500` | Connection verified, scan done |
| Warning / caution | `amber-500` | Missing config, partial state |
| Error / critical | `red-500` | Scan errors, critical findings |
| Findings severity | `red` (critical) · `orange` (high) · `amber` (medium) · `sky` (low) | Finding badges |

---

## Typography

| Use | Font | Tailwind |
|-----|------|---------|
| Display headings (page titles, hero text) | Playfair Display | `font-display` |
| All other text | Ubuntu | (default body font) |
| Monospace (code, IDs, paths) | System monospace | `font-mono` |

### Text sizes in context

| Size | Use |
|------|-----|
| `text-sm` (14px) | Card titles, section headings |
| `text-xs` (12px) | Body text, labels, descriptions |
| `text-[11px]` | Secondary detail, sublabels |
| `text-[10px]` | Timestamps, small badges, captions |
| `text-[9px]` | Micro badges (like "Recommended"), tight labels |

---

## Component Patterns

### Cards

```html
<div class="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-5">
```

Accented card (uses feature color):
```html
<div class="rounded-xl border border-indigo-500/20 bg-[var(--bg-card)] p-5">
```

### Buttons

Use `GlassButton` for primary actions. Raw `<button>` is acceptable for icon-only controls and inline actions.

```html
<!-- Primary action -->
<GlassButton @click="...">
  <Icon class="size-3.5" />
  Label
</GlassButton>

<!-- Ghost / secondary -->
<GlassButton variant="ghost" @click="...">...</GlassButton>

<!-- Icon-only -->
<button class="flex size-6 items-center justify-center rounded transition-colors hover:bg-white/[0.05] text-[var(--text-faint)] hover:text-[var(--text)]">
  <Icon class="size-3.5" />
</button>
```

### Badges / Chips

```html
<!-- Status chip -->
<span class="rounded-full px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/15 text-emerald-300">
  Available
</span>

<!-- Feature badge -->
<span class="rounded-full border border-violet-500/25 bg-violet-500/10 px-2 py-0.5 text-[9px] font-semibold text-violet-300">
  Claude
</span>
```

### Inputs

Always use `GlassInput` for labeled text fields. For inline search, use the pattern:
```html
<label class="relative">
  <Search class="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-[var(--text-faint)]" />
  <input class="h-9 rounded-lg border border-[var(--border)] bg-black/10 pl-9 pr-3 text-xs ...">
</label>
```

### Section headers (within pages)

```html
<p class="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-faint)]">
  Section Name
</p>
```

---

## Layout Principles

### Spacing
- Page content: `max-w-4xl mx-auto space-y-6 pb-8`
- Card internal padding: `p-4` or `p-5`
- Item gaps within cards: `space-y-3` or `gap-3`

### Scrollbars
The app uses custom scrollbars via `.custom-scroll` utility class. Apply to any scrollable container that shouldn't use the OS default.

### Sidebar
- Width: fixed, set in `AppSidebar.vue`
- Items: icon + label, compact, with active-state highlight
- Sections: labeled with uppercase `text-[10px]` headers

### Modals
Always use `GlassModal`. Title goes in the `title` prop. Use `max-width="md"` for standard dialogs, `"lg"` for wider content.

---

## Icon Usage

- **Library**: lucide-vue-next exclusively
- **Sizes**: `size-3` (tiny), `size-3.5` (standard in buttons/badges), `size-4` (section headers), `size-5` (card icons)
- **Color**: inherit from parent text color; use feature accent color for decorative icons

---

## Animation & Transitions

- Hover states: `transition-colors` (150ms default)
- Show/hide panels: `Transition` with `enter-active-class="transition-all duration-200 ease-out"` / `leave-active-class="transition-all duration-150 ease-in"`
- Loaders: `animate-spin` on `Loader2`
- Streaming text: appears incrementally; no artificial delays

---

## Dos and Don'ts

**Do:**
- Use translucent overlays (`bg-black/10`, `bg-white/[0.04]`) for depth
- Keep interactive surfaces distinct from static content via border + subtle hover bg
- Use `disabled:opacity-40` for disabled states
- Show loading states for all async actions

**Don't:**
- Use solid white or solid black for cards — always translucent
- Hard-code pixel widths for text labels (use Tailwind utilities)
- Add emoji to UI unless the user explicitly requests it
- Use shadows heavily — prefer borders for elevation cues
- Use more than 2 font families in any single view
