import { TreeDeciduous } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-background border-t-2 border-primary/20">
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Main Content */}
          <div className="flex flex-col items-center text-center space-y-8">
            {/* Logo & Brand */}
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
                <TreeDeciduous className="w-8 h-8 text-primary" />
              </div>
              <span className="text-2xl font-bold text-foreground">Vriksha.ai</span>
            </div>

            {/* Mantra */}
            <div className="space-y-2">
              <p className="text-xl font-semibold text-foreground">
                Rooted in India. Growing the Future of AI.
              </p>
              <p className="text-muted-foreground">
                Made in India, for the world.
              </p>
            </div>

            {/* Divider */}
            <div className="w-full max-w-md h-px bg-gradient-to-r from-transparent via-border to-transparent" />

            {/* Links */}
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <a href="#ventures" className="text-muted-foreground hover:text-primary transition-colors">
                Ventures
              </a>
              <a href="#philosophy" className="text-muted-foreground hover:text-primary transition-colors">
                Philosophy
              </a>
              <a href="#team" className="text-muted-foreground hover:text-primary transition-colors">
                Team
              </a>
              <a href="#contact" className="text-muted-foreground hover:text-primary transition-colors">
                Contact
              </a>
            </div>

            {/* Copyright */}
            <div className="text-sm text-muted-foreground pt-4">
              © {new Date().getFullYear()} Vriksha.ai. All rights reserved.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
