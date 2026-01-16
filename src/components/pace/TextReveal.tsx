import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

interface TextRevealProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

export function TextReveal({ children, delay = 0, className = "" }: TextRevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const element = ref.current;
      if (!element) return;

      // Set initial state - hidden
      gsap.set(element, {
        opacity: 0,
        y: 40,
      });

      // Animate in with smooth easing
      gsap.to(element, {
        opacity: 1,
        y: 0,
        duration: 1,
        delay: delay,
        ease: "power3.out",
      });
    },
    { 
      scope: ref, 
      dependencies: [delay]
    }
  );

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
