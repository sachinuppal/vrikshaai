import Hero from "@/components/Hero";
import Philosophy from "@/components/Philosophy";
import Accelerator from "@/components/Accelerator";
import Ventures from "@/components/Ventures";
import Gamification from "@/components/Gamification";
import WhyIndia from "@/components/WhyIndia";
import JoinEcosystem from "@/components/JoinEcosystem";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Hero />
      <Philosophy />
      <Accelerator />
      <Ventures />
      <Gamification />
      <WhyIndia />
      <JoinEcosystem />
      <FAQ />
      <Footer />
    </div>
  );
};

export default Index;
