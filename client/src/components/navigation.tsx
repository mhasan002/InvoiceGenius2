import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { FileText, Menu, X } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export default function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

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
    // TODO: Implement login functionality
    console.log("Login clicked");
  };

  const handleSignup = () => {
    // TODO: Implement signup functionality
    console.log("Get Started clicked");
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
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <FileText className="text-primary mr-2 h-8 w-8" />
                InvoiceGen
              </h1>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
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
                  <div className="pt-4 border-t">
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
