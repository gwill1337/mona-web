import { ArchitectureSection } from "@/components/Architecture";
import { FeaturesSection } from "@/components/Features";
import { Hero } from "@/components/Hero";
import { SetupSection } from "@/components/Setup";

export default function Home() {
  return (
    <div className="bg-black">
      <section id="hero">
        <Hero />
      </section>
      <section id="features">
        <FeaturesSection />
      </section>
      <section id="setup">
        <SetupSection />
      </section>
      <section id="architecture">
        <ArchitectureSection />
      </section>
    </div>
  );
}
