# Quick Reference Notes

## Setup Commands (January 2026)

```bash
# Initialize Vite + React with Bun
bun create vite . --template react-ts

# Install Tailwind CSS v4
bun add tailwindcss @tailwindcss/vite

# Install GSAP (ScrollTrigger is included free)
bun add gsap @gsap/react

# Install shadcn/ui (canary for React 19 + Tailwind v4)
bunx shadcn@canary init
bunx shadcn@canary add button card badge
```

## Critical Gotchas

### ❌ GSAP SplitText is NOT free
- Requires Club GSAP membership ($99+/year)
- Solution: Custom text splitter in `reveal-text.tsx`

### ❌ Gradient text + split text = broken
```tsx
// DON'T DO THIS - gradient breaks when text is split into spans
<RevealText className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
  Broken gradient
</RevealText>

// DO THIS - use solid colors
<RevealText className="text-purple-500">
  Works fine
</RevealText>
```

### ❌ Line reveal with plain text = fails
```tsx
// DON'T DO THIS - plain text won't split into lines
<RevealText type="lines">
  Line one
  Line two
</RevealText>

// DO THIS - use child elements
<RevealText type="lines">
  <div>Line one</div>
  <div>Line two</div>
</RevealText>
```

### ✅ Animation replay on scroll
```typescript
// ScrollTrigger callbacks for replay behavior
ScrollTrigger.create({
  trigger: element,
  start: "top 85%",
  end: "bottom 15%",
  onEnter: () => tl.restart(),      // Scroll down into view
  onEnterBack: () => tl.restart(),  // Scroll back up into view
  onLeave: () => tl.pause(0),       // Leave bottom (reset)
  onLeaveBack: () => tl.pause(0),   // Leave top (reset)
});
```

### ✅ Tailwind v4 Vite plugin
```typescript
// vite.config.ts - use the new Vite plugin
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
});
```

```css
/* index.css - use @import and @theme */
@import "tailwindcss";

@theme {
  --color-primary: oklch(9.8% 0 0);
}
```

## File Locations

| What | Where |
|------|-------|
| RevealText component | `src/components/gsap/reveal-text.tsx` |
| shadcn/ui components | `src/components/ui/` |
| Tailwind theme | `src/index.css` |
| Demo page | `src/App.tsx` |
| Path aliases | `tsconfig.json` + `vite.config.ts` |
| shadcn config | `components.json` |

## RevealText Props Quick Ref

```tsx
<RevealText
  type="chars"           // "chars" | "words" | "lines"
  scrollTrigger={true}   // Animate on scroll (default: true)
  gsapVars={{            // Override animation
    duration: 0.6,
    ease: "power3.out",
    stagger: 0.03,
    x: 40,
    y: 0,
    scale: 1,
    rotation: 0,
  }}
  className="..."        // Tailwind classes
>
  Text to animate
</RevealText>
```
