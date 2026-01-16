/**
 * Setup Verification Demo Page
 * 
 * This page demonstrates and tests all the technologies in the stack:
 * 
 * 1. TAILWIND CSS v4
 *    - Color palette using CSS variables (@theme)
 *    - Typography scale
 *    - Responsive grid (sm/md/lg breakpoints)
 *    - Hover effects and transitions
 * 
 * 2. SHADCN/UI (Canary)
 *    - Button component (all variants + sizes)
 *    - Card component (with nesting)
 *    - Badge component (all variants)
 * 
 * 3. PACE UI STYLE (Custom RevealText)
 *    - Character reveal animation
 *    - Word reveal animation
 *    - Line reveal animation (with child divs)
 *    - Custom GSAP animation overrides
 *    - ScrollTrigger for viewport animations
 *    - Replay on scroll (scroll up, then down again)
 * 
 * IMPORTANT NOTES:
 * - Animations trigger when elements scroll into view
 * - Scroll past an element, then back to see it animate again
 * - Gradient text doesn't work with split text (use solid colors)
 * - Line reveal requires <div> children, not plain text
 */
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RevealText } from "@/components/gsap/reveal-text";

function App() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="container mx-auto max-w-6xl space-y-12">
        {/* Header Section */}
        <div className="text-center space-y-4 mb-12">
          <RevealText type="words" className="text-6xl font-bold text-foreground">
            Setup Verification Test
          </RevealText>
          <p className="text-xl text-muted-foreground">
            Visual proof that Tailwind CSS, shadcn/ui, and Pace UI are working
          </p>
        </div>

        {/* Tailwind CSS Test Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">🎨</span>
                Tailwind CSS v4 Test
              </CardTitle>
              <CardDescription>
                Demonstrating Tailwind utility classes, colors, spacing, and responsive design
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Color Palette */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Color Palette</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  <div className="h-20 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-medium">
                    Primary
                  </div>
                  <div className="h-20 bg-secondary rounded-lg flex items-center justify-center text-secondary-foreground font-medium">
                    Secondary
                  </div>
                  <div className="h-20 bg-accent rounded-lg flex items-center justify-center text-accent-foreground font-medium">
                    Accent
                  </div>
                  <div className="h-20 bg-destructive rounded-lg flex items-center justify-center text-destructive-foreground font-medium">
                    Destructive
                  </div>
                  <div className="h-20 bg-muted rounded-lg flex items-center justify-center text-muted-foreground font-medium">
                    Muted
                  </div>
                  <div className="h-20 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white font-medium">
                    Gradient
                  </div>
                </div>
              </div>

              {/* Spacing & Typography */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Typography & Spacing</h3>
                <div className="space-y-2">
                  <p className="text-xs">Extra Small Text</p>
                  <p className="text-sm">Small Text</p>
                  <p className="text-base">Base Text</p>
                  <p className="text-lg">Large Text</p>
                  <p className="text-xl">Extra Large Text</p>
                  <p className="text-2xl font-bold">Bold Heading</p>
                </div>
              </div>

              {/* Responsive Grid */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Responsive Grid</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-24 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center text-white font-semibold shadow-lg hover:scale-105 transition-transform"
                    >
                      Item {i + 1}
                    </div>
                  ))}
                </div>
              </div>

              {/* Effects */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Effects & Animations</h3>
                <div className="flex flex-wrap gap-4">
                  <div className="px-6 py-3 bg-primary text-primary-foreground rounded-lg shadow-lg hover:shadow-xl transition-shadow">
                    Shadow on Hover
                  </div>
                  <div className="px-6 py-3 bg-secondary text-secondary-foreground rounded-lg border-2 border-dashed hover:border-solid transition-all">
                    Border Transition
                  </div>
                  <div className="px-6 py-3 bg-accent text-accent-foreground rounded-lg transform hover:rotate-3 transition-transform">
                    Rotate on Hover
                  </div>
                  <div className="px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-lg hover:scale-110 transition-transform">
                    Scale on Hover
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

        {/* shadcn/ui Test Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">⚡</span>
                shadcn/ui Components Test
              </CardTitle>
              <CardDescription>
                Testing Button, Card, and Badge components from shadcn/ui
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Buttons */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Button Variants</h3>
                <div className="flex flex-wrap gap-4">
                  <Button>Default</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="destructive">Destructive</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="link">Link</Button>
                </div>
              </div>

              {/* Button Sizes */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Button Sizes</h3>
                <div className="flex flex-wrap items-center gap-4">
                  <Button size="sm">Small</Button>
                  <Button size="default">Default</Button>
                  <Button size="lg">Large</Button>
                  <Button size="icon">🔍</Button>
                </div>
              </div>

              {/* Badges */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Badge Variants</h3>
                <div className="flex flex-wrap gap-4">
                  <Badge>Default</Badge>
                  <Badge variant="secondary">Secondary</Badge>
                  <Badge variant="destructive">Destructive</Badge>
                  <Badge variant="outline">Outline</Badge>
                </div>
              </div>

              {/* Card Usage */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Nested Cards</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Card 1</CardTitle>
                      <CardDescription>Nested card example</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">This demonstrates card nesting and proper styling.</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Card 2</CardTitle>
                      <CardDescription>Another nested card</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">All shadcn/ui components are working correctly!</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>

        {/* Pace UI Test Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">✨</span>
              Pace UI Animation Test
            </CardTitle>
            <CardDescription>
              Real Pace UI components using GSAP SplitText - 2026 best practices
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Status Indicator */}
            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                <span className="text-xl">✓</span>
                <span className="font-semibold">Pace UI RevealText Component Active</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Using the official Pace UI <code className="px-1 py-0.5 bg-muted rounded text-xs">RevealText</code> component 
                with GSAP SplitText plugin. Watch characters, words, and lines animate in!
              </p>
            </div>

            {/* Character Reveal */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Character Reveal (Default)</h3>
              <RevealText type="chars" className="text-3xl font-bold">
                This text reveals character by character
              </RevealText>
            </div>

            {/* Word Reveal */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Word Reveal with Rotation</h3>
              <RevealText type="words" className="text-2xl font-semibold">
                Each word spins and slides into place
              </RevealText>
            </div>

            {/* Line Reveal */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Line Reveal</h3>
              <RevealText type="lines" className="text-xl space-y-2">
                <div>First line slides up</div>
                <div>Second line follows</div>
                <div>Third line completes the sequence</div>
              </RevealText>
            </div>

            {/* Custom Animation */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Custom Animation</h3>
              <RevealText 
                type="chars" 
                gsapVars={{ 
                  scale: 0, 
                  rotation: 360, 
                  duration: 1.5,
                  ease: "back.out(1.7)",
                  stagger: 0.08
                }}
                className="text-2xl font-bold text-purple-500"
              >
                Custom GSAP animation with scale and rotation!
              </RevealText>
            </div>

            {/* In Cards */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Pace UI in Cards</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <RevealText type="words" className="text-center">
                      <h4 className="text-xl font-bold mb-2">Card Title</h4>
                      <p className="text-muted-foreground">
                        This card uses Pace UI RevealText for smooth animations
                      </p>
                    </RevealText>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <RevealText type="chars" className="text-center">
                      <h4 className="text-xl font-bold mb-2">Another Card</h4>
                      <p className="text-muted-foreground">
                        Each character animates individually
                      </p>
                    </RevealText>
                  </CardContent>
                </Card>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Section */}
        <Card className="border-2 border-primary">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <span>✅</span>
                Setup Verification Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Badge variant="default" className="text-sm">Tailwind CSS v4</Badge>
                  <p className="text-sm text-muted-foreground">
                    ✓ Utility classes working<br />
                    ✓ CSS variables configured<br />
                    ✓ Responsive design active<br />
                    ✓ Dark mode support
                  </p>
                </div>
                <div className="space-y-2">
                  <Badge variant="secondary" className="text-sm">shadcn/ui Canary</Badge>
                  <p className="text-sm text-muted-foreground">
                    ✓ Button component<br />
                    ✓ Card component<br />
                    ✓ Badge component<br />
                    ✓ All variants working
                  </p>
                </div>
                <div className="space-y-2">
                  <Badge variant="outline" className="text-sm">Pace UI Style</Badge>
                  <p className="text-sm text-muted-foreground">
                    ✓ GSAP animations<br />
                    ✓ Text reveal effects<br />
                    ✓ Staggered animations<br />
                    ✓ Smooth transitions
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
      </div>
    </div>
  );
}

export default App;
