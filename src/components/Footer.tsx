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

            {/* Brand Line */}
            <div className="space-y-2">
              <p className="text-xl font-semibold text-foreground">
                Vriksha.ai — Rooted in India. Growing the Future of AI.
              </p>
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
