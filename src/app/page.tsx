"use client";

import Scene from "@/components/scene/Scene";
import LoadingScreen from "@/components/ui/LoadingScreen";
import Navbar from "@/components/ui/Navbar";
import HeroText from "@/components/ui/HeroText";
import ProjectsSection from "@/components/ui/ProjectsSection";
import AboutSection from "@/components/ui/AboutSection";
import ContactSection from "@/components/ui/ContactSection";

export default function Home() {
  return (
    <>
      <LoadingScreen />
      <Scene />
      <main className="relative z-10">
        <Navbar />
        <section id="home" className="min-h-screen">
          <HeroText />
        </section>
        <ProjectsSection />
        <AboutSection />
        <ContactSection />
      </main>
    </>
  );
}
