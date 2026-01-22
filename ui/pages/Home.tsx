import { Navbar, Footer } from "@/ui/components/layout";
import {
  HeroSection,
  ProblemsSection,
  SolutionSection,
  FeaturesSection,
  UseCasesSection,
  DemoSection,
  SocialProofSection,
  CTASection,
  FAQSection,
} from "@/ui/features/landing/components";

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <HeroSection />
        <ProblemsSection />
        <SolutionSection />
        <FeaturesSection />
        <UseCasesSection />
        <DemoSection />
        <SocialProofSection />
        <CTASection />
        <FAQSection />
      </main>
      <Footer />
    </div>
  );
}
