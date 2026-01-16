# Ben Hinton Calculator

A React project showcasing modern frontend technologies with animated text reveals.

## Tech Stack

- **Runtime**: [Bun](https://bun.sh/) - Fast JavaScript runtime and package manager
- **Build**: [Vite](https://vitejs.dev/) - Next-generation frontend tooling
- **Framework**: [React 19](https://react.dev/) - Latest React with concurrent features
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) - Utility-first CSS framework
- **Components**: [shadcn/ui (canary)](https://ui.shadcn.com/) - Re-usable components built with Radix UI
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
```

## Project Structure

```
src/
├── components/
│   ├── gsap/
│   │   └── reveal-text.tsx    # Custom text reveal component (Pace UI style)
│   └── ui/
│       ├── button.tsx         # shadcn/ui button
│       ├── card.tsx           # shadcn/ui card
│       └── badge.tsx          # shadcn/ui badge
├── lib/
│   └── utils.ts               # cn() utility for class merging
├── App.tsx                    # Demo page showcasing all features
├── index.css                  # Tailwind + shadcn/ui theme
└── main.tsx                   # React entry point
```

## Key Learnings

### 1. GSAP SplitText is Premium

The Pace UI `RevealText` component typically uses GSAP's `SplitText` plugin, but **SplitText requires a paid Club GSAP membership**. 

**Solution**: We implemented a custom text splitter in `reveal-text.tsx` that provides the same functionality using free GSAP:

```typescript
// Custom text splitting for chars, words, and lines
function splitTextIntoElements(element: HTMLElement, type: SplitType): HTMLElement[] {
  if (type === "chars") {
    // Split into individual character spans
  } else if (type === "words") {
    // Split into word spans with preserved spacing
  } else if (type === "lines") {
    // Animate direct child elements as lines
  }
}
```

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

### 4. shadcn/ui Canary for React 19 + Tailwind v4

Use the canary version for compatibility:

```bash
bunx shadcn@canary init
bunx shadcn@canary add button card badge
```

### 5. Path Aliases

Configure `@/` imports in both TypeScript and Vite:

```json
// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": { "@/*": ["./src/*"] }
  }
}
```

```typescript
// vite.config.ts
resolve: {
  alias: {
    "@": path.resolve(__dirname, "./src"),
  },
}
```

## RevealText Component Usage

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

// Disable scroll trigger (animate immediately)
<RevealText scrollTrigger={false}>
  Animates on mount
</RevealText>
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `type` | `"chars" \| "words" \| "lines"` | `"chars"` | Split type |
| `gsapVars` | `gsap.TweenVars` | — | Custom animation overrides |
| `scrollTrigger` | `boolean` | `true` | Trigger on scroll into view |
| `className` | `string` | — | Tailwind classes |

### Default Animations

- **chars**: Slide in from right (x: 40, stagger: 0.03s)
- **words**: Slide in from right + up (x: 30, y: -20, stagger: 0.15s)
- **lines**: Slide up (y: 50, stagger: 0.25s)

## Demo Page

The `App.tsx` contains a comprehensive test page demonstrating:

1. **Tailwind CSS v4** - Colors, typography, responsive grid, hover effects
2. **shadcn/ui** - Button variants/sizes, Card nesting, Badge variants
3. **Pace UI Animations** - All RevealText types with custom animations

Visit `http://localhost:5173` to see everything in action.

## Important Notes

- **Gradient text + split**: CSS `background-clip: text` with gradients doesn't work with split text (each span loses gradient context). Use solid colors for animated text.
- **Line reveal**: Requires child elements (divs) - it animates the direct children, not text nodes.
- **Hot reload**: Vite HMR works great, but animation state may need a page refresh after component changes.

## Dependencies

```json
{
  "dependencies": {
    "@gsap/react": "^2.1.2",
    "@radix-ui/react-slot": "^1.2.4",
    "@tailwindcss/vite": "^4.1.18",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "gsap": "^3.14.2",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "tailwind-merge": "^3.4.0",
    "tailwindcss": "^4.1.18"
  }
}
```

## License

MIT
