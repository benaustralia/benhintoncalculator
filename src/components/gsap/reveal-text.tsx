/**
 * RevealText - Pace UI Style Text Reveal Component
 * 
 * A custom implementation of animated text reveals inspired by Pace UI,
 * using free GSAP features instead of the premium SplitText plugin.
 * 
 * KEY LEARNINGS (January 2026):
 * 
 * 1. GSAP SplitText is PREMIUM - requires Club GSAP membership ($99+/year)
 *    Solution: Custom text splitter that creates inline-block spans
 * 
 * 2. ScrollTrigger is FREE - included in main gsap package
 *    Use for viewport-triggered animations
 * 
 * 3. Replay on scroll requires Timeline + ScrollTrigger callbacks
 *    - onEnter/onEnterBack: restart animation
 *    - onLeave/onLeaveBack: pause at frame 0 (reset)
 * 
 * 4. Gradient text (bg-clip-text) DOES NOT WORK with split text
 *    Each span loses the gradient context. Use solid colors instead.
 * 
 * 5. Line reveal requires CHILD ELEMENTS (<div>), not text nodes
 *    The splitter animates direct children for "lines" type
 * 
 * @example
 * // Character reveal
 * <RevealText type="chars">Hello World</RevealText>
 * 
 * // Word reveal
 * <RevealText type="words">Each word animates</RevealText>
 * 
 * // Line reveal (requires child divs)
 * <RevealText type="lines">
 *   <div>Line one</div>
 *   <div>Line two</div>
 * </RevealText>
 * 
 * // Custom animation
 * <RevealText gsapVars={{ scale: 0, rotation: 360, stagger: 0.1 }}>
 *   Custom!
 * </RevealText>
 */
"use client";

import { ComponentProps, useRef, ReactNode } from "react";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register ScrollTrigger plugin (FREE plugin included with GSAP)
gsap.registerPlugin(ScrollTrigger);

type SplitType = "chars" | "words" | "lines";

type RevealTextProps = {
  type?: SplitType;
  gsapVars?: gsap.TweenVars;
  children: ReactNode;
  /** Trigger animation on scroll into view (default: true) */
  scrollTrigger?: boolean;
} & Omit<ComponentProps<"div">, "children">;

const defaultGsapVars: Record<SplitType, gsap.TweenVars> = {
  chars: {
    x: 40,
    opacity: 0,
    duration: 0.6,
    ease: "power3.out",
    stagger: 0.03,
  },
  words: {
    x: 30,
    opacity: 0,
    ease: "power3.out",
    duration: 0.8,
    stagger: 0.15,
    y: -20,
  },
  lines: {
    duration: 0.8,
    y: 50,
    opacity: 0,
    stagger: 0.25,
    ease: "power3.out",
  },
};

// Custom text splitter - free alternative to premium SplitText plugin
function splitTextIntoElements(
  element: HTMLElement,
  type: SplitType
): HTMLElement[] {
  // Handle lines type - animate direct children or create line wrappers
  if (type === "lines") {
    const children = Array.from(element.children) as HTMLElement[];
    if (children.length > 0) {
      // Animate direct child elements as lines
      return children;
    }
    // Fallback for plain text - treat as single line
    const text = element.textContent || "";
    if (!text.trim()) return [];
    
    element.innerHTML = "";
    const wrapper = document.createElement("div");
    wrapper.style.overflow = "hidden";
    const inner = document.createElement("div");
    inner.textContent = text;
    wrapper.appendChild(inner);
    element.appendChild(wrapper);
    return [inner];
  }

  const text = element.textContent || "";
  element.innerHTML = "";

  if (type === "chars") {
    // Split into characters, preserve spaces
    const chars = text.split("");
    return chars.map((char) => {
      const span = document.createElement("span");
      span.style.display = "inline-block";
      span.style.whiteSpace = char === " " ? "pre" : "normal";
      if (char === " ") {
        span.innerHTML = "&nbsp;";
      } else {
        span.textContent = char;
      }
      element.appendChild(span);
      return span;
    });
  } else {
    // Words
    const words = text.split(/\s+/).filter(Boolean);
    return words.map((word, i) => {
      const span = document.createElement("span");
      span.style.display = "inline-block";
      span.textContent = word;
      element.appendChild(span);
      if (i < words.length - 1) {
        const space = document.createElement("span");
        space.innerHTML = "&nbsp;";
        element.appendChild(space);
      }
      return span;
    });
  }
}

export const RevealText = ({
  type = "chars",
  gsapVars = {},
  scrollTrigger = true,
  children,
  ...props
}: RevealTextProps) => {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  useGSAP(
    () => {
      const element = wrapperRef.current;
      if (!element) return;

      // Split text and get elements to animate
      const elements = splitTextIntoElements(element, type);

      if (elements.length === 0) {
        gsap.set(element, { opacity: 1 });
        return;
      }

      // Merge default vars with custom gsapVars for "from" state
      const defaults = defaultGsapVars[type];
      const fromVars: gsap.TweenVars = {
        opacity: gsapVars.opacity ?? defaults.opacity ?? 0,
        x: gsapVars.x ?? defaults.x ?? 0,
        y: gsapVars.y ?? defaults.y ?? 0,
      };

      // Add scale and rotation if specified
      if (gsapVars.scale !== undefined) {
        fromVars.scale = gsapVars.scale;
      }
      if (gsapVars.rotation !== undefined) {
        fromVars.rotation = gsapVars.rotation;
      }
      if (gsapVars.yPercent !== undefined || defaults.yPercent !== undefined) {
        fromVars.yPercent = gsapVars.yPercent ?? defaults.yPercent;
      }

      // Show wrapper
      gsap.set(element, { opacity: 1 });

      // Create timeline for better control
      const tl = gsap.timeline({ paused: true });
      
      // Set initial state
      tl.set(elements, fromVars);
      
      // Animate to final state
      tl.to(elements, {
        opacity: 1,
        x: 0,
        y: 0,
        yPercent: 0,
        rotation: 0,
        scale: 1,
        duration: gsapVars.duration ?? defaults.duration,
        ease: gsapVars.ease ?? defaults.ease,
        stagger: gsapVars.stagger ?? defaults.stagger,
      });

      timelineRef.current = tl;

      if (scrollTrigger) {
        // Create ScrollTrigger that resets when leaving viewport
        ScrollTrigger.create({
          trigger: element,
          start: "top 85%",
          end: "bottom 15%",
          onEnter: () => tl.restart(),
          onEnterBack: () => tl.restart(),
          onLeave: () => tl.pause(0),
          onLeaveBack: () => tl.pause(0),
        });
      } else {
        // Play immediately
        tl.play();
      }
    },
    { scope: wrapperRef, dependencies: [type, scrollTrigger] }
  );

  return (
    <div {...props} ref={wrapperRef} style={{ opacity: 0, ...props.style }}>
      {children}
    </div>
  );
};
