import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="relative bg-background border-t-2 border-primary/20 overflow-hidden">
      {/* Watermark Brand Text */}
      <div 
        className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0"
        aria-hidden="true"
      >
        <span className="text-[8rem] sm:text-[12rem] md:text-[16rem] lg:text-[20rem] font-bold text-primary/[0.06] whitespace-nowrap tracking-tight">
          Vriksha.AI
        </span>
      </div>

      {/* Footer Content */}
      <div className="container mx-auto px-6 py-12 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Main Content */}
          <div className="flex flex-col items-center text-center space-y-8">
            {/* Logo & Brand */}
            <div className="flex items-center gap-3">
              <img src="/images/vriksha-logo.png" alt="Vriksha.ai Logo" className="w-16 h-16 rounded-xl" />
              <span className="text-2xl font-bold text-foreground">Vriksha.ai</span>
            </div>

            {/* Brand Line */}
            <div className="space-y-2">
              <p className="text-xl font-semibold text-foreground">
                Vriksha.ai — Rooted in India. Co-Building AI that People Want.
              </p>
            </div>

            {/* Legal Links */}
            <div className="flex items-center gap-4 text-sm flex-wrap justify-center">
              <Link 
                to="/contact" 
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                Contact Us
              </Link>
              <span className="text-muted-foreground">|</span>
              <Link 
                to="/terms" 
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                Terms of Use
              </Link>
              <span className="text-muted-foreground">|</span>
              <Link 
                to="/privacy" 
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                Privacy Policy
              </Link>
              <span className="text-muted-foreground">|</span>
              <Link 
                to="/cookies" 
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                Cookie Settings
              </Link>
            </div>

            {/* Copyright */}
            <div className="text-sm text-muted-foreground pt-4">
              © 2025 Vriksha.ai | Made in India for the world.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
