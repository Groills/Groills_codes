import BenefitsSection from "@/components/BenefitsSection";
import ContactSection from "@/components/ContactSection";
import HeroSection from "@/components/HeroSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import SpecificationsSection from "@/components/SpecsSection";


export default function Home() {
  return (
    <main className="min-h-screen">
      <HeroSection />
      <BenefitsSection />
      <SpecificationsSection />
      <HowItWorksSection />
      <ContactSection />
    </main>
  );
}
