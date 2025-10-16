import Hero from "@/components/Hero";
import Philosophy from "@/components/Philosophy";
import Gamification from "@/components/Gamification";
import WhyIndia from "@/components/WhyIndia";
import StudioModel from "@/components/StudioModel";
import Team from "@/components/Team";
import JoinEcosystem from "@/components/JoinEcosystem";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Hero />
      <Philosophy />
      <Gamification />
      <WhyIndia />
      <StudioModel />
      <Team />
      <JoinEcosystem />
      <Footer />
    </div>
  );
};

export default Index;
