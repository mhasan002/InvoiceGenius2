import { Button } from "@/components/ui/button";
import { Rocket, Play, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function CTASection() {
  const handleSignup = () => {
    // TODO: Implement signup functionality
    console.log("Get Started clicked");
  };

  const handleDemo = () => {
    // TODO: Implement demo functionality
    console.log("Watch Demo clicked");
  };

  const features = [
    "Free forever plan",
    "No setup fees",
    "Cancel anytime"
  ];

  return (
    <section className="py-20 bg-primary">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to streamline your invoicing?
          </h2>
          <p className="text-xl text-blue-100 mb-8 leading-relaxed">
            Start for Free — No Credit Card Required
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={handleSignup}
              size="lg"
              className="bg-white hover:bg-gray-100 text-primary px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
              data-testid="button-cta-signup"
            >
              <Rocket className="mr-2 h-5 w-5" />
              Get Started Free
            </Button>
            <Button
              onClick={handleDemo}
              variant="outline"
              size="lg"
              className="bg-transparent hover:bg-white/10 text-white border-2 border-white px-8 py-4 text-lg font-semibold transition-all duration-200"
              data-testid="button-cta-demo"
            >
              <Play className="mr-2 h-5 w-5" />
              Watch Demo
            </Button>
          </div>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-6 text-blue-100 text-sm">
            {features.map((feature, index) => (
              <motion.div
                key={feature}
                className="flex items-center"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.8 + index * 0.1 }}
                data-testid={`cta-feature-${index}`}
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                <span>{feature}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}