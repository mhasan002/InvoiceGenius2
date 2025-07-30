import { Button } from "@/components/ui/button";
import { Rocket, LogIn, CheckCircle, FileText, BarChart3, Zap, Shield } from "lucide-react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";

export default function HeroSection() {
  const [, setLocation] = useLocation();

  const handleGetStarted = () => {
    setLocation("/auth/signup");
  };

  const handleLogin = () => {
    setLocation("/auth/login");
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
            <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center gap-6 text-gray-500 text-sm">
              <div className="flex items-center">
                <CheckCircle className="text-green-500 mr-2 h-4 w-4" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="text-green-500 mr-2 h-4 w-4" />
                <span>Free forever plan</span>
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
              {/* Main Dashboard Preview */}
              <div className="dashboard-shadow rounded-2xl overflow-hidden bg-white border border-gray-100">
                <div className="w-full h-[420px] bg-gradient-to-br from-slate-50 to-blue-50 p-8">
                  <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <FileText className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">InvoiceGen</h3>
                    <p className="text-gray-600">Create beautiful invoices instantly</p>
                  </div>
                  
                  {/* Feature Grid */}
                  <div className="grid grid-cols-2 gap-4 mt-8">
                    <motion.div 
                      className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-white/50 shadow-sm"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.6 }}
                    >
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mb-2">
                        <Zap className="w-4 h-4 text-green-600" />
                      </div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-1">Fast Setup</h4>
                      <p className="text-xs text-gray-500">Ready in minutes</p>
                    </motion.div>
                    
                    <motion.div 
                      className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-white/50 shadow-sm"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.7 }}
                    >
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mb-2">
                        <BarChart3 className="w-4 h-4 text-blue-600" />
                      </div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-1">Analytics</h4>
                      <p className="text-xs text-gray-500">Track payments</p>
                    </motion.div>
                    
                    <motion.div 
                      className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-white/50 shadow-sm"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.8 }}
                    >
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mb-2">
                        <Shield className="w-4 h-4 text-purple-600" />
                      </div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-1">Secure</h4>
                      <p className="text-xs text-gray-500">Bank-level security</p>
                    </motion.div>
                    
                    <motion.div 
                      className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-white/50 shadow-sm"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.9 }}
                    >
                      <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mb-2">
                        <FileText className="w-4 h-4 text-orange-600" />
                      </div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-1">Templates</h4>
                      <p className="text-xs text-gray-500">Professional designs</p>
                    </motion.div>
                  </div>
                </div>
              </div>
              
              {/* Floating success notifications */}
              <motion.div
                className="absolute -top-4 -right-4 bg-green-500 text-white px-4 py-2 rounded-xl text-sm font-medium shadow-lg"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 1.2 }}
                data-testid="status-invoice-sent"
              >
                <CheckCircle className="inline mr-2 h-4 w-4" />
                Invoice Sent!
              </motion.div>
              
              <motion.div
                className="absolute -bottom-4 -left-4 bg-blue-500 text-white px-4 py-2 rounded-xl text-sm font-medium shadow-lg"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 1.4 }}
                data-testid="status-pdf-ready"
              >
                <svg className="inline mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
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