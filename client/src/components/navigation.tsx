import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { FileText, Menu, X, User, LogOut } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";

export default function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [location] = useLocation();
  const { user, logout, isAuthenticated } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setIsOpen(false);
  };

  const handleLogin = () => {
    window.location.href = "/auth/login";
  };

  const handleSignup = () => {
    window.location.href = "/auth/signup";
  };

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = "/";
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100"
          : "bg-white shadow-sm border-b border-gray-100"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link href="/">
                <h1 className="text-2xl font-bold text-gray-900 flex items-center cursor-pointer hover:text-primary transition-colors">
                  <FileText className="text-primary mr-2 h-8 w-8" />
                  InvoiceGen
                </h1>
              </Link>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              {location === "/" && (
                <>
                  <button
                    onClick={() => handleNavClick("#features")}
                    className="text-gray-600 hover:text-primary px-3 py-2 text-sm font-medium transition-colors"
                    data-testid="nav-features"
                  >
                    Features
                  </button>
                  <button
                    onClick={() => handleNavClick("#how-it-works")}
                    className="text-gray-600 hover:text-primary px-3 py-2 text-sm font-medium transition-colors"
                    data-testid="nav-how-it-works"
                  >
                    How It Works
                  </button>
                  <button
                    onClick={() => handleNavClick("#pricing")}
                    className="text-gray-600 hover:text-primary px-3 py-2 text-sm font-medium transition-colors"
                    data-testid="nav-pricing"
                  >
                    Pricing
                  </button>
                </>
              )}
              
              {isAuthenticated ? (
                <>
                  <Link href="/dashboard">
                    <Button
                      variant="ghost"
                      className="text-gray-600 hover:text-primary px-3 py-2 text-sm font-medium"
                    >
                      Dashboard
                    </Button>
                  </Link>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="text-gray-600 hover:text-primary px-3 py-2 text-sm font-medium flex items-center"
                      >
                        <User className="h-4 w-4 mr-2" />
                        {user?.username}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href="/settings" className="flex items-center cursor-pointer">
                          <User className="h-4 w-4 mr-2" />
                          Settings
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleLogout} className="flex items-center cursor-pointer">
                        <LogOut className="h-4 w-4 mr-2" />
                        Logout
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    onClick={handleLogin}
                    className="text-gray-600 hover:text-primary px-3 py-2 text-sm font-medium"
                    data-testid="button-login"
                  >
                    Login
                  </Button>
                  <Button
                    onClick={handleSignup}
                    className="bg-primary hover:bg-primary/90 text-white px-4 py-2 text-sm font-medium"
                    data-testid="button-get-started"
                  >
                    Get Started
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-600 hover:text-primary"
                  data-testid="button-mobile-menu"
                >
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <nav className="flex flex-col space-y-4 mt-8">
                  {location === "/" && (
                    <>
                      <button
                        onClick={() => handleNavClick("#features")}
                        className="text-left text-gray-600 hover:text-primary px-3 py-2 text-lg font-medium transition-colors"
                        data-testid="mobile-nav-features"
                      >
                        Features
                      </button>
                      <button
                        onClick={() => handleNavClick("#how-it-works")}
                        className="text-left text-gray-600 hover:text-primary px-3 py-2 text-lg font-medium transition-colors"
                        data-testid="mobile-nav-how-it-works"
                      >
                        How It Works
                      </button>
                      <button
                        onClick={() => handleNavClick("#pricing")}
                        className="text-left text-gray-600 hover:text-primary px-3 py-2 text-lg font-medium transition-colors"
                        data-testid="mobile-nav-pricing"
                      >
                        Pricing
                      </button>
                    </>
                  )}
                  <div className="pt-4 border-t">
                    {isAuthenticated ? (
                      <>
                        <Link href="/dashboard">
                          <Button
                            variant="ghost"
                            className="w-full justify-start text-gray-600 hover:text-primary text-lg font-medium"
                            onClick={() => setIsOpen(false)}
                          >
                            Dashboard
                          </Button>
                        </Link>
                        <Link href="/settings">
                          <Button
                            variant="ghost"
                            className="w-full justify-start text-gray-600 hover:text-primary text-lg font-medium"
                            onClick={() => setIsOpen(false)}
                          >
                            <User className="h-4 w-4 mr-2" />
                            Settings
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          onClick={() => {
                            handleLogout();
                            setIsOpen(false);
                          }}
                          className="w-full justify-start text-gray-600 hover:text-primary text-lg font-medium"
                        >
                          <LogOut className="h-4 w-4 mr-2" />
                          Logout ({user?.username})
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          variant="ghost"
                          onClick={handleLogin}
                          className="w-full justify-start text-gray-600 hover:text-primary text-lg font-medium"
                          data-testid="mobile-button-login"
                        >
                          Login
                        </Button>
                        <Button
                          onClick={handleSignup}
                          className="w-full mt-2 bg-primary hover:bg-primary/90 text-white text-lg font-medium"
                          data-testid="mobile-button-get-started"
                        >
                          Get Started
                        </Button>
                      </>
                    )}
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}