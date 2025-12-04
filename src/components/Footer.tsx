import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-background border-t-2 border-primary/20">
      <div className="container mx-auto px-6 py-12">
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
                Vriksha.ai — Rooted in India. Growing the Future of AI.
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
