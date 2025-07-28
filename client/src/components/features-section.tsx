import { Palette, Package, TrendingUp, FileText } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    icon: Palette,
    title: "Customizable Templates",
    description: "Choose from beautiful, professional templates and customize them to match your brand perfectly.",
    color: "text-primary",
    bgColor: "bg-primary/10"
  },
  {
    icon: Package,
    title: "Service & Package Manager",
    description: "Organize your services and packages for quick invoice creation. Save time with reusable items.",
    color: "text-cyan-500",
    bgColor: "bg-cyan-500/10"
  },
  {
    icon: TrendingUp,
    title: "Real-time Insights",
    description: "Track payment status, monitor overdue invoices, and get insights into your business revenue.",
    color: "text-green-500",
    bgColor: "bg-green-500/10"
  },
  {
    icon: FileText,
    title: "PDF Export",
    description: "Generate professional PDF invoices instantly. Email directly or download for your records.",
    color: "text-purple-500",
    bgColor: "bg-purple-500/10"
  }
];

export default function FeaturesSection() {
  return (
    <section id="features" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Everything you need to invoice like a pro
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Streamline your billing process with powerful features designed for modern businesses
          </p>
        </motion.div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              className="bg-gray-50 rounded-2xl p-8 hover:shadow-lg transition-all duration-300 hover:bg-white border border-gray-100"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -4 }}
              data-testid={`feature-${index}`}
            >
              <div className={`w-14 h-14 ${feature.bgColor} rounded-xl flex items-center justify-center mb-6`}>
                <feature.icon className={`${feature.color} h-7 w-7`} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4" data-testid={`feature-title-${index}`}>
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed" data-testid={`feature-description-${index}`}>
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
