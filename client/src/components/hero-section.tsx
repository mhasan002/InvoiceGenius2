import { Button } from "@/components/ui/button";
import { Rocket, LogIn, CheckCircle, Settings } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "wouter";

export default function HeroSection() {
  const handleGetStarted = () => {
    // TODO: Implement get started functionality
    console.log("Get Started clicked");
  };

  const handleLogin = () => {
    // TODO: Implement login functionality
    console.log("Login clicked");
  };

  return (
    <section className="gradient-bg py-20 lg:py-28 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-12 items-center">
          <motion.div
            className="lg:col-span-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
              Create Invoices{" "}
              <span className="text-primary">Effortlessly</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Professional, customizable, and ready to send in minutes. Transform your billing process with our intuitive invoice generator.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={handleGetStarted}
                size="lg"
                className="bg-primary hover:bg-primary/90 text-white px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                data-testid="button-hero-get-started"
              >
                <Rocket className="mr-2 h-5 w-5" />
                Get Started Free
              </Button>
              <Button
                onClick={handleLogin}
                variant="outline"
                size="lg"
                className="bg-white hover:bg-gray-50 text-gray-700 px-8 py-4 text-lg font-semibold border-2 border-gray-200 hover:shadow-lg transition-all duration-200"
                data-testid="button-hero-login"
              >
                <LogIn className="mr-2 h-5 w-5" />
                Login
              </Button>
            </div>
            <div className="mt-8 space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 text-gray-500 text-sm">
                <div className="flex items-center">
                  <CheckCircle className="text-green-500 mr-2 h-4 w-4" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="text-green-500 mr-2 h-4 w-4" />
                  <span>Free forever plan</span>
                </div>
              </div>
              <div className="pt-2">
                <Link href="/settings">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-gray-600 hover:text-primary border-gray-200 hover:border-primary"
                    data-testid="button-setup-database"
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Connect Supabase Database
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="lg:col-span-6 mt-12 lg:mt-0"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="relative">
              <div className="dashboard-shadow rounded-2xl overflow-hidden bg-white">
                <div className="w-full h-[400px] bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-24 h-24 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center">
                        <div className="grid grid-cols-3 gap-1">
                          {[...Array(9)].map((_, i) => (
                            <div key={i} className="w-1 h-1 bg-white rounded-full" />
                          ))}
                        </div>
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Invoice Dashboard</h3>
                    <p className="text-sm text-gray-500">Professional invoice creation tool</p>
                  </div>
                </div>
              </div>
              
              {/* Floating elements */}
              <motion.div
                className="absolute -top-4 -right-4 bg-green-100 text-green-600 px-4 py-2 rounded-xl text-sm font-medium shadow-lg"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.8 }}
                data-testid="status-invoice-sent"
              >
                <CheckCircle className="inline mr-1 h-4 w-4" />
                Invoice Sent!
              </motion.div>
              <motion.div
                className="absolute -bottom-4 -left-4 bg-blue-100 text-blue-600 px-4 py-2 rounded-xl text-sm font-medium shadow-lg"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 1.0 }}
                data-testid="status-pdf-ready"
              >
                <svg className="inline mr-1 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                PDF Ready
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}