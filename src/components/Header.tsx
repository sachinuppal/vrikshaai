import { useState } from "react";
import { Link } from "react-router-dom";
import { 
  Menu, 
  LogOut, 
  FileText, 
  User, 
  ChevronDown,
  Phone,
  Brain,
  Eye,
  Satellite,
  Bot,
  Database,
  Building2,
  Banknote,
  Heart,
  Zap,
  TreeDeciduous
} from "lucide-react";
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
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

const products = [
  {
    title: "AI CRM",
    description: "World's first AI Relationship Engine",
    href: "/crm",
    icon: TreeDeciduous,
  },
  {
    title: "Vriksha Voice",
    description: "AI-powered calling platform",
    href: "/voice",
    icon: Phone,
  },
];

const aiInfrastructure = [
  {
    title: "Voice AI & Conversational Engines",
    description: "Natural language interactions",
    href: "/#ai-infrastructure",
    icon: Brain,
  },
  {
    title: "Image & Video AI",
    description: "Visual intelligence solutions",
    href: "/#ai-infrastructure",
    icon: Eye,
  },
  {
    title: "Geo-Satellite AI",
    description: "Location & satellite insights",
    href: "/#ai-infrastructure",
    icon: Satellite,
  },
  {
    title: "AI Robotics",
    description: "Autonomous systems & automation",
    href: "/#ai-infrastructure",
    icon: Bot,
  },
  {
    title: "Data & Analytics",
    description: "Enterprise data intelligence",
    href: "/#ai-infrastructure",
    icon: Database,
  },
];

const industries = [
  {
    title: "Real Estate",
    description: "Property & construction AI",
    href: "/crm#industries",
    icon: Building2,
  },
  {
    title: "Finance",
    description: "Banking & lending solutions",
    href: "/crm#industries",
    icon: Banknote,
  },
  {
    title: "Healthcare",
    description: "Patient care automation",
    href: "/crm#industries",
    icon: Heart,
  },
  {
    title: "Energy & Solar",
    description: "Sustainable energy AI",
    href: "/crm#industries",
    icon: Zap,
  },
];

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [solutionsOpen, setSolutionsOpen] = useState(false);
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
            {/* Solutions Mega Menu */}
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="bg-transparent text-sm font-medium text-muted-foreground hover:text-primary data-[state=open]:text-primary">
                    Solutions
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="w-[600px] lg:w-[700px] p-4 lg:p-6 bg-card border border-border rounded-lg shadow-xl">
                      <div className="grid grid-cols-3 gap-6">
                        {/* Products Column */}
                        <div>
                          <h4 className="text-sm font-semibold text-primary mb-4 uppercase tracking-wider">Products</h4>
                          <div className="space-y-3">
                            {products.map((item) => (
                              <NavigationMenuLink key={item.title} asChild>
                                <Link
                                  to={item.href}
                                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-primary/10 transition-colors group"
                                >
                                  <item.icon className="w-5 h-5 text-primary mt-0.5" />
                                  <div>
                                    <div className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                                      {item.title}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      {item.description}
                                    </div>
                                  </div>
                                </Link>
                              </NavigationMenuLink>
                            ))}
                          </div>
                        </div>

                        {/* AI Infrastructure Column */}
                        <div>
                          <h4 className="text-sm font-semibold text-primary mb-4 uppercase tracking-wider">AI Infrastructure</h4>
                          <div className="space-y-2">
                            {aiInfrastructure.map((item) => (
                              <NavigationMenuLink key={item.title} asChild>
                                <Link
                                  to={item.href}
                                  className="flex items-start gap-3 p-2 rounded-lg hover:bg-primary/10 transition-colors group"
                                >
                                  <item.icon className="w-4 h-4 text-muted-foreground group-hover:text-primary mt-0.5" />
                                  <div>
                                    <div className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                                      {item.title}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      {item.description}
                                    </div>
                                  </div>
                                </Link>
                              </NavigationMenuLink>
                            ))}
                          </div>
                        </div>

                        {/* Industries Column */}
                        <div>
                          <h4 className="text-sm font-semibold text-primary mb-4 uppercase tracking-wider">Industries</h4>
                          <div className="space-y-2">
                            {industries.map((item) => (
                              <NavigationMenuLink key={item.title} asChild>
                                <Link
                                  to={item.href}
                                  className="flex items-start gap-3 p-2 rounded-lg hover:bg-primary/10 transition-colors group"
                                >
                                  <item.icon className="w-4 h-4 text-muted-foreground group-hover:text-primary mt-0.5" />
                                  <div>
                                    <div className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                                      {item.title}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      {item.description}
                                    </div>
                                  </div>
                                </Link>
                              </NavigationMenuLink>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>

            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                {link.name}
              </Link>
            ))}
            
            {/* Auth Section - Only show when logged in */}
            {user && (
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
            )}
          </nav>

          {/* Mobile Menu */}
          <div className="flex items-center gap-2 md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-foreground">
                  <Menu className="w-6 h-6" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] bg-background overflow-y-auto">
                <SheetHeader className="text-left">
                  <SheetTitle className="flex items-center gap-2">
                    <img src="/images/vriksha-logo.png" alt="Vriksha.ai Logo" className="w-10 h-10 rounded-lg" />
                    <span className="text-lg font-bold">Vriksha.ai</span>
                  </SheetTitle>
                </SheetHeader>
                
                <nav className="flex flex-col gap-2 mt-8">
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
                  
                  {/* Solutions Collapsible */}
                  <Collapsible open={solutionsOpen} onOpenChange={setSolutionsOpen}>
                    <CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-3 rounded-lg text-foreground hover:bg-primary/10 hover:text-primary transition-colors">
                      <span className="font-medium">Solutions</span>
                      <ChevronDown className={cn("w-4 h-4 transition-transform", solutionsOpen && "rotate-180")} />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pl-4 space-y-1 mt-2">
                      {/* Products */}
                      <div className="px-4 py-2 text-xs font-semibold text-primary uppercase tracking-wider">Products</div>
                      {products.map((item) => (
                        <Link
                          key={item.title}
                          to={item.href}
                          onClick={() => setIsOpen(false)}
                          className="flex items-center gap-3 px-4 py-2 rounded-lg text-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                        >
                          <item.icon className="w-4 h-4 text-primary" />
                          <span className="text-sm">{item.title}</span>
                        </Link>
                      ))}
                      
                      {/* AI Infrastructure */}
                      <div className="px-4 py-2 text-xs font-semibold text-primary uppercase tracking-wider mt-2">AI Infrastructure</div>
                      {aiInfrastructure.map((item) => (
                        <Link
                          key={item.title}
                          to={item.href}
                          onClick={() => setIsOpen(false)}
                          className="flex items-center gap-3 px-4 py-2 rounded-lg text-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                        >
                          <item.icon className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">{item.title}</span>
                        </Link>
                      ))}
                      
                      {/* Industries */}
                      <div className="px-4 py-2 text-xs font-semibold text-primary uppercase tracking-wider mt-2">Industries</div>
                      {industries.map((item) => (
                        <Link
                          key={item.title}
                          to={item.href}
                          onClick={() => setIsOpen(false)}
                          className="flex items-center gap-3 px-4 py-2 rounded-lg text-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                        >
                          <item.icon className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">{item.title}</span>
                        </Link>
                      ))}
                    </CollapsibleContent>
                  </Collapsible>
                  
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
