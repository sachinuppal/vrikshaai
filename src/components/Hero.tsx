import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import HubSpotFormModal from "@/components/HubSpotFormModal";

const Hero = () => {
  const [showContent, setShowContent] = useState(false);
  const [videoDuration, setVideoDuration] = useState(0);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [useStaticBg, setUseStaticBg] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);

  useEffect(() => {
    const checkMobile = () => window.innerWidth < 768;
    setIsMobile(checkMobile());

    const handleResize = () => setIsMobile(checkMobile());
    window.addEventListener('resize', handleResize);

    const connection = (navigator as any).connection;
    if (connection && (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g')) {
      setUseStaticBg(true);
    }

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

  const headlineWords = "Co-Building AI that People Want.".split(" ");
  const subHeadlineWords = "We co-create products, back execution, and grow real companies together.".split(" ");

  const wordVariants = {
    hidden: { opacity: 0, y: 20, filter: "blur(8px)" },
    visible: { opacity: 1, y: 0, filter: "blur(0px)" },
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-hero">
      {/* Video Background */}
      {useStaticBg ? (
        <div className={`absolute inset-0 bg-gradient-hero transition-opacity duration-1000 ${showContent ? 'opacity-60' : 'opacity-100'}`} />
      ) : (
        <div className={`absolute inset-0 transition-opacity duration-1000 ${showContent ? 'opacity-30' : 'opacity-60'}`}>
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

      {/* Warm Gradient Overlay */}
      <div className={`absolute inset-0 bg-gradient-to-b from-background/40 via-background/60 to-background transition-opacity duration-1000 ${showContent ? 'opacity-100' : 'opacity-0'}`} />

      {/* Content */}
      <div className={`relative z-10 container mx-auto px-4 sm:px-6 py-16 sm:py-20 text-center transition-opacity duration-2000 ${showContent ? 'opacity-100' : 'opacity-0'}`}>
        <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={showContent ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-full bg-card border border-primary/20 shadow-soft"
          >
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse-soft" />
            <span className="text-xs sm:text-sm font-semibold text-primary">India's First AI Venture Studio & Accelerator</span>
          </motion.div>

          {/* Main Headline with word-by-word reveal */}
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight leading-tight">
            <motion.span
              className="text-foreground block"
              initial="hidden"
              animate={showContent ? "visible" : "hidden"}
              transition={{ staggerChildren: 0.05, delayChildren: 0.4 }}
            >
              {headlineWords.map((word, index) => (
                <motion.span
                  key={index}
                  variants={wordVariants}
                  transition={{ duration: 0.4 }}
                  className="inline-block mr-[0.25em]"
                >
                  {word}
                </motion.span>
              ))}
            </motion.span>
            <motion.span
              className="bg-gradient-neural bg-clip-text text-transparent block"
              initial="hidden"
              animate={showContent ? "visible" : "hidden"}
              transition={{ staggerChildren: 0.06, delayChildren: 0.8 }}
            >
              {subHeadlineWords.map((word, index) => (
                <motion.span
                  key={index}
                  variants={wordVariants}
                  transition={{ duration: 0.4 }}
                  className="inline-block mr-[0.25em]"
                >
                  {word}
                </motion.span>
              ))}
            </motion.span>
          </h1>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={showContent ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 1.5 }}
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center pt-4"
          >
            <Button 
              size="lg"
              onClick={() => setShowContactModal(true)}
              className="min-h-[48px] bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 sm:px-10 py-4 sm:py-6 text-base sm:text-lg rounded-xl transition-all hover:scale-105 hover:shadow-hover active:scale-95"
            >
              Contact Us
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => {
                const selectors = [
                  '[data-dv-agent-trigger]',
                  '.dv-agent-button',
                  '.ringg-widget-button',
                  'button[class*="dv-"]',
                  'button[class*="ringg"]'
                ];
                
                for (const selector of selectors) {
                  const trigger = document.querySelector(selector) as HTMLElement;
                  if (trigger) {
                    trigger.click();
                    return;
                  }
                }
                
                console.warn('Ringg widget button not found');
              }}
              className="min-h-[48px] border-2 border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground font-semibold px-8 sm:px-10 py-4 sm:py-6 text-base sm:text-lg rounded-xl transition-all hover:scale-105 active:scale-95"
            >
              Talk to Us
            </Button>
          </motion.div>
        </div>
      </div>

      <HubSpotFormModal open={showContactModal} onOpenChange={setShowContactModal} />
    </section>
  );
};

export default Hero;
