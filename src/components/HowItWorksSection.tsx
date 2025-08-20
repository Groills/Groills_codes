// components/HowItWorks.tsx
"use client";

import { motion, Variants } from "framer-motion";
import { TextGenerateEffect } from "./ui/text-generate-effect";
import { useEffect, useState } from "react";
import Link from "next/link"

const steps = [
  {
    title: "Create Profile",
    description: "Showcase your skills and learning goals",
    icon: "📝",
    color: "text-purple-400",
  },
  {
    title: "Upload Videos",
    description: "Upload videos and get more videos to learn.",
    icon: "🔍",
    color: "text-blue-400",
  },
  {
    title: "Start Swapping",
    description: "Connect and exchange skills seamlessly",
    icon: "🔄",
    color: "text-cyan-400",
  },
  {
    title: "Track Progress",
    description: "Monitor your skill development journey",
    icon: "📈",
    color: "text-emerald-400",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3,
    },
  },
};

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 10,
    },
  },
};
type Bubble = {
  width: number;
  height: number;
  top: number;
  left: number;
  xMove: number;
  duration: number;
  color: string;
};
export default function HowItWorksSection() {
  const [bubbles, setBubbles] = useState<Bubble[]>([]);

  useEffect(() => {
    const generated = Array.from({ length: 8 }, () => ({
      width: Math.random() * 200 + 100,
      height: Math.random() * 200 + 100,
      top: Math.random() * 100,
      left: Math.random() * 100,
      xMove: Math.random() * 40 - 20,
      duration: 5 + Math.random() * 10,
      color: Math.random() > 0.5 ? "bg-purple-500" : "bg-blue-500",
    }));
    setBubbles(generated);
  }, []);
  return (
    <section className="relative py-30 bg-black overflow-hidden" id="How-it-works">
      {/* Decorative floating circles */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        {bubbles.map((bubble, i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, 30, 0],
              x: [0, Math.random() * 40 - 20, 0],
              transition: {
                duration: bubble.duration,
                repeat: Infinity,
                ease: "easeInOut",
              },
            }}
            className={`absolute rounded-full opacity-10 ${
              i % 2 ? "bg-purple-500" : "bg-blue-500"
            }`}
            style={{
              width: `${bubble.width}px`,
              height: `${bubble.height}px`,
              top: `${bubble.top}%`,
              left: `${bubble.left}%`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" >
        <div className="text-center mb-16">
          <TextGenerateEffect
            name= "how-it-works"
            words="How It Works"
            className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-500"
          />
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-4 text-lg text-neutral-400 max-w-2xl mx-auto"
          >
            The simple process to start swapping skills with others
          </motion.p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {steps.map((step, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ y: -5 }}
              className="group"
            >
              <div className="h-full bg-neutral-900/80 backdrop-blur-sm border border-neutral-800 rounded-xl p-6 transition-all duration-300 group-hover:border-purple-500/50">
                <div className={`text-4xl mb-4 ${step.color}`}>{step.icon}</div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  {step.title}
                </h3>
                <p className="text-neutral-400 text-sm">{step.description}</p>
                <motion.div
                  className="mt-4 h-1 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
                  initial={{ width: 0 }}
                  whileInView={{ width: "100%" }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  viewport={{ once: true }}
                />
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <Link href="/sign-in">
          <button className="px-8 py-3 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium hover:shadow-lg hover:shadow-purple-500/30 transition-all">
            Get Started
          </button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
