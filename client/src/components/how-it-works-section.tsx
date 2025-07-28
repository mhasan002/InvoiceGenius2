import { Plus, Edit, Download } from "lucide-react";
import { motion } from "framer-motion";

const steps = [
  {
    icon: Plus,
    number: "1",
    title: "Add Services & Company Info",
    description: "Input your business details and add the services or products you're billing for.",
    color: "bg-primary",
    borderColor: "border-primary",
    textColor: "text-primary"
  },
  {
    icon: Edit,
    number: "2",
    title: "Customize Your Invoice",
    description: "Choose a template, adjust colors, add your logo, and personalize the invoice to match your brand.",
    color: "bg-cyan-500",
    borderColor: "border-cyan-500",
    textColor: "text-cyan-500"
  },
  {
    icon: Download,
    number: "3",
    title: "Download or Share PDF",
    description: "Generate your professional PDF invoice and send it directly to clients or download for your records.",
    color: "bg-green-500",
    borderColor: "border-green-500",
    textColor: "text-green-500"
  }
];

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-20 gradient-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Get your professional invoices ready in just three simple steps
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              className="text-center relative"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              data-testid={`step-${index}`}
            >
              <div className="relative">
                <motion.div
                  className={`w-20 h-20 ${step.color} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg`}
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <step.icon className="text-white h-8 w-8" />
                </motion.div>
                <div className={`absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center ${step.textColor} font-bold text-sm border-2 ${step.borderColor}`}>
                  <span data-testid={`step-number-${index}`}>{step.number}</span>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4" data-testid={`step-title-${index}`}>
                {step.title}
              </h3>
              <p className="text-gray-600 leading-relaxed" data-testid={`step-description-${index}`}>
                {step.description}
              </p>
              
              {/* Connection line for desktop */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-10 left-full w-full h-0.5 bg-gray-200 -translate-x-1/2" style={{ width: 'calc(100% - 80px)' }} />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
