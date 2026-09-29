import { useCallback, useState } from "react";
import Preloader from "./components/Preloader";
import SmoothScroll from "./components/SmoothScroll";
import Grain from "./components/Grain";
import Cursor from "./components/Cursor";
import ScrollProgress from "./components/ScrollProgress";
import Nav from "./components/Nav";
import Hero from "./components/Hero";
import Marquee from "./components/Marquee";
import Manifesto from "./components/Manifesto";
import Projects from "./components/Projects";
import Services from "./components/Services";
import Process from "./components/Process";
import Studio from "./components/Studio";
import Testimonials from "./components/Testimonials";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import ProjectOverlay from "./components/ProjectOverlay";
import { usePrefersReducedMotion } from "./lib/motion";
import { projects } from "./data/projects";
import type { Project, ProjectEntry } from "./data/projects";

type Stage = "loading" | "revealing" | "live";

export default function App() {
  usePrefersReducedMotion();

  const [stage, setStage] = useState<Stage>("loading");
  const [entry, setEntry] = useState<ProjectEntry | null>(null);

  const openProject = useCallback((project: Project, source: HTMLElement | null) => {
    setEntry({ project, source });
  }, []);

  // Already inside the overlay: there is no thumbnail to grow from, so the
  // incoming project cuts in behind the curtain instead.
  const stepTo = useCallback((project: Project) => {
    setEntry({ project, source: null });
  }, []);

  return (
    <>
      <SmoothScroll paused={stage === "loading"}>
        <main>
          <Hero play={stage !== "loading"} />
          <Marquee />
          <Manifesto />
          <Projects onOpen={openProject} />
          <Services />
          <Process />
          <Studio />
          <Testimonials />
          <Contact />
          <Footer />
        </main>
      </SmoothScroll>

      <Nav ready={stage !== "loading"} overlayOpen={entry !== null} />
      <Grain />
      <Cursor />
      <ScrollProgress />
      <ProjectOverlay
        entry={entry}
        projects={projects}
        onClose={() => setEntry(null)}
        onNext={stepTo}
      />

      {stage !== "live" && (
        <Preloader onReveal={() => setStage("revealing")} onDone={() => setStage("live")} />
      )}
    </>
  );
}
