import { useState } from "react";
import { Route, Routes, useLocation } from "react-router";
import Preloader from "./components/Preloader";
import SmoothScroll from "./components/SmoothScroll";
import Grain from "./components/Grain";
import Cursor from "./components/Cursor";
import ScrollProgress from "./components/ScrollProgress";
import Nav from "./components/Nav";
import RouteTransition from "./components/RouteTransition";
import Home from "./pages/Home";
import ProjectPage from "./pages/ProjectPage";
import { usePrefersReducedMotion } from "./lib/motion";
import { useAnchorScroll } from "./lib/anchorScroll";
import { useScrollMemory } from "./lib/scrollMemory";

type Stage = "loading" | "revealing" | "live";

export default function App() {
  usePrefersReducedMotion();

  const [stage, setStage] = useState<Stage>("loading");
  const { pathname } = useLocation();
  const loading = stage === "loading";

  // A project is a page you read, not a page you navigate from: the way out is
  // its own close control, so the header does not hover over the work at all.
  const onProject = pathname.startsWith("/work/");
  useScrollMemory();
  useAnchorScroll();

  // The smoother wraps the routes rather than living inside one of them, so
  // scrolling survives a page change instead of being torn down and rebuilt.
  return (
    <RouteTransition>
      <SmoothScroll paused={loading}>
        <Routes>
          <Route path="/" element={<Home play={!loading} />} />
          <Route path="/work/:slug" element={<ProjectPage />} />
        </Routes>
      </SmoothScroll>

      {!onProject && <Nav ready={!loading} />}
      <Grain />
      <Cursor />
      <ScrollProgress />

      {stage !== "live" && (
        <Preloader onReveal={() => setStage("revealing")} onDone={() => setStage("live")} />
      )}
    </RouteTransition>
  );
}
