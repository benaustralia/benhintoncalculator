# TutorTerm Calculator

A React project featuring the TutorTerm 2026 Calculator with modern frontend technologies and animated text reveals.

## Tech Stack

- **Runtime**: [Bun](https://bun.sh/) - Fast JavaScript runtime and package manager
- **Build**: [Vite](https://vitejs.dev/) - Next-generation frontend tooling
- **Framework**: [React 19](https://react.dev/) - Latest React with concurrent features
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) - Utility-first CSS framework
- **Components**: [shadcn/ui](https://ui.shadcn.com/) - Re-usable components built with Radix UI
- **Animations**: [GSAP](https://gsap.com/) + [ScrollTrigger](https://gsap.com/docs/v3/Plugins/ScrollTrigger/) - Professional-grade animations
- **Style**: Pace UI inspired - Animated text reveal components

## Quick Start

```bash
# Install dependencies
bun install

# Start dev server
bun run dev

# Build for production
bun run build

# Deploy to GitHub Pages
bun run deploy
```

## Project Structure

```
src/
├── components/
│   ├── Dashboard.tsx              # Main TutorTerm Calculator dashboard
│   ├── dashboard/
│   │   ├── Controls.tsx           # Calculator controls
│   │   ├── LogisticsCard.tsx      # Logistics display
│   │   ├── PricingCard.tsx        # Pricing display
│   │   └── ScheduleCard.tsx       # Schedule display
│   ├── gsap/
│   │   └── reveal-text.tsx        # Custom text reveal component (Pace UI style)
│   └── ui/                        # shadcn/ui components
│       ├── accordion.tsx
│       ├── button.tsx
│       ├── card.tsx
│       ├── select/
│       │   └── ...
│       └── tabs.tsx
├── hooks/
│   └── useTermLogistics.ts        # Calculator logic hook
├── constants.ts                   # Calculator constants
├── lib/
│   └── utils.ts                   # cn() utility for class merging
├── App.tsx                        # Main app entry
├── DemoPage.tsx                   # Demo page showcasing GSAP/Tailwind/shadcn
├── index.css                      # Tailwind + shadcn/ui theme
└── main.tsx                       # React entry point
```

## Features

### TutorTerm 2026 Calculator
- Term scheduling and pricing calculations
- Mobile-optimized responsive design
- Interactive controls with real-time updates

### Demo Page (`DemoPage.tsx`)
A comprehensive test page demonstrating:
1. **Tailwind CSS v4** - Colors, typography, responsive grid, hover effects
2. **shadcn/ui** - Button variants/sizes, Card nesting, Badge variants
3. **Pace UI Animations** - All RevealText types with custom animations

## RevealText Component

### Usage

```tsx
import { RevealText } from "@/components/gsap/reveal-text";

// Character reveal (default)
<RevealText type="chars" className="text-3xl font-bold">
  This text reveals character by character
</RevealText>

// Word reveal
<RevealText type="words" className="text-2xl">
  Each word animates separately
</RevealText>

// Line reveal (requires child elements)
<RevealText type="lines">
  <div>First line</div>
  <div>Second line</div>
  <div>Third line</div>
</RevealText>

// Custom animation
<RevealText 
  type="chars" 
  gsapVars={{ 
    scale: 0, 
    rotation: 360, 
    duration: 1.5,
    ease: "back.out(1.7)",
    stagger: 0.08
  }}
>
  Custom animation!
</RevealText>
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `type` | `"chars" \| "words" \| "lines"` | `"chars"` | Split type |
| `gsapVars` | `gsap.TweenVars` | — | Custom animation overrides |
| `scrollTrigger` | `boolean` | `true` | Trigger on scroll into view |
| `className` | `string` | — | Tailwind classes |

## Key Learnings

### 1. GSAP SplitText is Premium

The Pace UI `RevealText` component typically uses GSAP's `SplitText` plugin, but **SplitText requires a paid Club GSAP membership**. 

**Solution**: We implemented a custom text splitter in `reveal-text.tsx` that provides the same functionality using free GSAP.

### 2. ScrollTrigger for Viewport Animations

Animations trigger when elements scroll into view, and **replay when scrolling back**:

```typescript
ScrollTrigger.create({
  trigger: element,
  start: "top 85%",           // Trigger at 85% down viewport
  end: "bottom 15%",
  onEnter: () => tl.restart(),      // Play when scrolling down
  onEnterBack: () => tl.restart(),  // Play when scrolling up  
  onLeave: () => tl.pause(0),       // Reset when leaving
  onLeaveBack: () => tl.pause(0),
});
```

### 3. Tailwind CSS v4 Setup

Tailwind v4 uses the new Vite plugin approach:

```typescript
// vite.config.ts
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
});
```

```css
/* index.css */
@import "tailwindcss";

@theme {
  --color-primary: oklch(9.8% 0 0);
  /* ... shadcn/ui theme variables */
}
```

### 4. CSS Variables Compatibility

The project maintains both Tailwind v4 (`@theme` with oklch colors) and legacy HSL variables for backwards compatibility with existing shadcn/ui components.

## Important Notes

- **Gradient text + split**: CSS `background-clip: text` with gradients doesn't work with split text (each span loses gradient context). Use solid colors for animated text.
- **Line reveal**: Requires child elements (divs) - it animates the direct children, not text nodes.
- **Hot reload**: Vite HMR works great, but animation state may need a page refresh after component changes.

## License

MIT
