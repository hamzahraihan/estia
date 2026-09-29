import Hero from "../components/Hero";
import Marquee from "../components/Marquee";
import Manifesto from "../components/Manifesto";
import Projects from "../components/Projects";
import Services from "../components/Services";
import Process from "../components/Process";
import Studio from "../components/Studio";
import Testimonials from "../components/Testimonials";
import Contact from "../components/Contact";
import Footer from "../components/Footer";

type Props = {
  /** False while the preloader still owns the viewport. */
  play: boolean;
};

export default function Home({ play }: Props) {
  return (
    <main>
      <Hero play={play} />
      <Marquee />
      <Manifesto />
      <Projects />
      <Services />
      <Process />
      <Studio />
      <Testimonials />
      <Contact />
      <Footer />
    </main>
  );
}
