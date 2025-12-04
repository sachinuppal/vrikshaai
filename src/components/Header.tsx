import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, LogOut, FileText, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut } = useAuth();

  const navLinks = [
    { name: "For Investors", path: "/investors" },
    { name: "For Enterprises", path: "/enterprises" },
    { name: "Contact Us", path: "/contact" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-primary/10">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <img src="/images/vriksha-logo.png" alt="Vriksha.ai Logo" className="w-14 h-14 rounded-lg group-hover:scale-110 transition-transform" />
            <span className="text-xl font-bold text-foreground">Vriksha.ai</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                {link.name}
              </Link>
            ))}
            
            {/* Auth Section */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <User className="w-4 h-4" />
                    <span className="max-w-[100px] truncate">{user.email?.split('@')[0]}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link to="/applications" className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      My Applications
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut} className="text-destructive">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild size="sm">
                <Link to="/auth">Apply Now</Link>
              </Button>
            )}
          </nav>

          {/* Mobile Menu */}
          <div className="flex items-center gap-2 md:hidden">
            {!user && (
              <Button asChild size="sm">
                <Link to="/auth">Apply</Link>
              </Button>
            )}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-foreground">
                  <Menu className="w-6 h-6" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] bg-background">
                <SheetHeader className="text-left">
                  <SheetTitle className="flex items-center gap-2">
                    <img src="/images/vriksha-logo.png" alt="Vriksha.ai Logo" className="w-10 h-10 rounded-lg" />
                    <span className="text-lg font-bold">Vriksha.ai</span>
                  </SheetTitle>
                </SheetHeader>
                
                <nav className="flex flex-col gap-4 mt-8">
                  {user && (
                    <>
                      <Link
                        to="/applications"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                      >
                        <FileText className="w-5 h-5" />
                        <span className="font-medium">My Applications</span>
                      </Link>
                      <div className="border-t border-border my-2" />
                    </>
                  )}
                  {navLinks.map((link) => (
                    <Link
                      key={link.path}
                      to={link.path}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg text-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                    >
                      <span className="font-medium">{link.name}</span>
                    </Link>
                  ))}
                  {user && (
                    <>
                      <div className="border-t border-border my-2" />
                      <button
                        onClick={() => {
                          signOut();
                          setIsOpen(false);
                        }}
                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <LogOut className="w-5 h-5" />
                        <span className="font-medium">Sign Out</span>
                      </button>
                    </>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
