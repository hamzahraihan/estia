import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGsap } from "../lib/motion";

export default function ScrollProgress() {
  const bar = useRef<HTMLDivElement>(null);

  useGsap((mm) => {
    mm.add("(prefers-reduced-motion)", () => {
      const fill = bar.current;
      if (!fill) return;
      gsap.set(fill, { scaleX: 0, transformOrigin: "left center" });
      const trigger = ScrollTrigger.create({
        start: 0,
        end: "max",
        onUpdate: (self) => gsap.set(fill, { scaleX: self.progress }),
      });
      return () => trigger.kill();
    });
  }, []);

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-90 h-px" aria-hidden="true">
      <div ref={bar} className="h-full w-full bg-clay" />
    </div>
  );
}
