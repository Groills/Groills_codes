// components/SpecificationsSection.tsx
"use client";

import { motion, Variants } from "framer-motion";
import { BackgroundGradient } from "@/components/ui/background-gradient";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { SparklesCore } from "./ui/sparkles";
import Link from "next/link";

const features = [
  {
    title: "Zero Cost Learning",
    description: "Exchange skills without spending money.",
    icon: "📖",
  },
  {
    title: "Skill Matching Algorithm",
    description: "Find the perfect partner for your learning instantly.",
    icon: "🤝",
  },
  {
    title: "Learning Analysics",
    description: "Track you learning progress in whole journey.",
    icon: "📊",
  },
  {
    title: "AI Coaching",
    description: "Clear doubt instantly with Groills AI Assistant.",
    icon: "🧠",
  },
  {
    title: "Global User Network",
    description:
      "Connect with learners from around the world.",
    icon: "🌐",
  },
  {
    title: "Personalized Dashboards",
    description: "Track your progress and manage all things in one place.",
    icon: "🗂️",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

const itemVariants: Variants  = {
  hidden: { y: 30, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 120,
      damping: 12,
    },
  },
};

export default function SpecificationsSection() {
  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-black" id="Specifications">
      {/* Animated Sparkles Background */}
      <div className="absolute inset-0 h-full w-full">
        <SparklesCore
          id="specs-sparkles"
          background="transparent"
          minSize={0.4}
          maxSize={1.2}
          particleDensity={50}
          className="h-full w-full"
          particleColor="#60a5fa"
        />
      </div>

      <div className="relative z-20 py-24 px-4 max-w-7xl mx-auto">
        {/* Animated Heading */}
        <div className="text-center mb-20">
          <TextGenerateEffect
            name="specifications"
            words="Our Specifications"
            className="text-[10px] sm:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-blue-200 to-blue-600"
          />
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-6 text-lg text-blue-100/80 max-w-3xl mx-auto"
          >
            The technical foundation powering our revolutionary skill exchange
            platform
          </motion.p>
        </div>

        {/* Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ y: -5 }}
            >
              <BackgroundGradient className="p-6 h-full rounded-2xl bg-zinc-900 ">
                <div className="flex flex-col h-full">
                  <span className="text-3xl mb-4">{feature.icon}</span>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-300">{feature.description}</p>
                </div>
              </BackgroundGradient>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA with Spotlight */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          viewport={{ once: true }}
          className="mt-24 flex justify-center" // Added flex and justify-center
        >
          <div className="relative overflow-hidden rounded-lg p-2 w-fit">
            {" "}
            {/* Changed to w-fit */}
            <div className="absolute -inset-2 bg-purple-500/50 blur-lg opacity-100 animate-pulse"></div>
            <Link href="/sign-in">
            <button className="relative px-2 py-2 bg-purple-600 text-white font-medium rounded-lg hover:shadow-xl hover:shadow-purple-500/20 transition-all">
              Start Now with Groills
            </button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
