import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import HubSpotFormModal from "@/components/HubSpotFormModal";

const Hero = () => {
  const [showContent, setShowContent] = useState(false);
  const [videoDuration, setVideoDuration] = useState(0);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [useStaticBg, setUseStaticBg] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);

  useEffect(() => {
    // Detect mobile
    const checkMobile = () => window.innerWidth < 768;
    setIsMobile(checkMobile());

    const handleResize = () => setIsMobile(checkMobile());
    window.addEventListener('resize', handleResize);

    // Check network speed if available
    const connection = (navigator as any).connection;
    if (connection && (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g')) {
      setUseStaticBg(true);
    }

    // Fallback timeout - show content after 5s if video hasn't loaded
    const timeout = setTimeout(() => {
      if (!isVideoLoaded) {
        setShowContent(true);
      }
    }, 5000);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeout);
    };
  }, [isVideoLoaded]);

  const handleLoadedMetadata = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    setVideoDuration(e.currentTarget.duration);
  };

  const handleTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    if (!showContent && videoDuration > 0 && e.currentTarget.currentTime >= videoDuration - 0.5) {
      setShowContent(true);
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background">
      {/* Video Background */}
      {useStaticBg ? (
        <div className={`absolute inset-0 bg-gradient-hero transition-opacity duration-1000 ${showContent ? 'opacity-40' : 'opacity-100'}`} />
      ) : (
        <div className={`absolute inset-0 bg-black transition-opacity duration-1000 ${showContent ? 'opacity-40' : 'opacity-100'}`}>
          <video
            autoPlay
            loop
            muted
            playsInline
            preload={isMobile ? "metadata" : "auto"}
            poster="https://vqglejkydwtopmllymuf.supabase.co/storage/v1/object/public/assets/vrikshaai.mp4"
            className="w-full h-full object-contain sm:object-cover object-center"
            src="https://vqglejkydwtopmllymuf.supabase.co/storage/v1/object/public/assets/vrikshaai.mp4"
            onLoadedMetadata={handleLoadedMetadata}
            onLoadedData={() => setIsVideoLoaded(true)}
            onTimeUpdate={handleTimeUpdate}
            onError={() => setUseStaticBg(true)}
          />
        </div>
      )}

      {/* Radial Gradient Overlay */}
      <div className={`absolute inset-0 bg-gradient-hero transition-opacity duration-1000 ${showContent ? 'opacity-100' : 'opacity-0'}`} />

      {/* Content */}
      <div className={`relative z-10 container mx-auto px-4 sm:px-6 py-16 sm:py-20 text-center transition-opacity duration-2000 ${showContent ? 'opacity-100' : 'opacity-0'}`}>
        <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
          {/* Badge */}
          <div className={`inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-card border-2 border-primary/40 backdrop-blur-sm transition-all duration-1000 ${showContent ? 'opacity-100' : 'opacity-0'}`}>
            <div className="w-2 h-2 rounded-full bg-secondary animate-glow-intense" />
            <span className="text-xs sm:text-sm font-medium text-primary">India's First AI Venture Studio & Accelerator</span>
          </div>

          {/* Main Headline */}
          <h1 className={`text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight leading-tight transition-all duration-1000 delay-300 ${showContent ? 'opacity-100' : 'opacity-0'}`}>
            <span className="text-foreground">Building India's AI Ecosystem —</span>
            <br />
            <span className="bg-gradient-neural bg-clip-text text-transparent animate-glow-pulse" style={{ backgroundSize: "200% auto" }}>
              One Venture, One Growth Story at a Time.
            </span>
          </h1>

          {/* Subtext */}
          <p className={`text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed transition-all duration-1000 delay-600 ${showContent ? 'opacity-100' : 'opacity-0'}`}>
            Vriksha.ai is an AI Venture Studio and Accelerator that co-builds and co-participates in the growth of AI-first products — from idea to global scale.
            <br />
            <span className="text-foreground font-medium">Rooted in Indian wisdom. Engineered with <span className="text-primary">modern intelligence</span>.</span>
          </p>

          {/* CTA Buttons */}
          <div className={`flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center pt-4 transition-all duration-1000 delay-[900ms] ${showContent ? 'opacity-100' : 'opacity-0'}`}>
            <Button 
              size="lg"
              onClick={() => setShowContactModal(true)}
              className="min-h-[44px] bg-primary hover:bg-primary-glow text-primary-foreground font-semibold px-6 sm:px-8 py-3 sm:py-6 text-base sm:text-lg rounded-lg transition-all hover:scale-105 active:scale-95"
              style={{ boxShadow: "var(--shadow-glow)" }}
            >
              Contact Us
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => {
                const trigger = document.querySelector('[data-dv-agent-trigger]') as HTMLElement;
                if (trigger) trigger.click();
              }}
              className="min-h-[44px] border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground font-semibold px-6 sm:px-8 py-3 sm:py-6 text-base sm:text-lg rounded-lg transition-all hover:scale-105 active:scale-95"
            >
              Talk to Us
            </Button>
          </div>
        </div>
      </div>

      <HubSpotFormModal open={showContactModal} onOpenChange={setShowContactModal} />
    </section>
  );
};

export default Hero;
