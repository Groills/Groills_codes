"use client";

import { motion } from "framer-motion";
import { CardBody, CardContainer, CardItem } from "@/components/ui/3d-card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState } from "react";

function BenefitsSection() {
  const [expandedCards, setExpandedCards] = useState<any>({});

  const benefits = [
    {
      title: "Connect with Like-Minded Learners",
      description:
        " bring together people who share the same passion for growth and creativity. Whether you’re learning a new language, mastering coding, or perfecting your photography skills, our platform connects you with individuals who are equally eager to share their knowledge and learn from yours.",
    },
    {
      title: "Learn Without Spending Money",
      description:
        "No expensive courses, no hidden fees — just pure skill exchange. Trade your expertise for someone else’s talent and grow together without financial barriers. Knowledge should be accessible to everyone, and that’s exactly what we deliver.",
    },
    {
      title: "Build Real-World Connections",
      description:
        "Our platform doesn’t just help you swap skills; it helps you build friendships, professional relationships, and lasting networks. The people you meet here can become collaborators, mentors, and even business partners in the future.",
    },
    {
      title: "Flexible Learning on Your Terms",
      description: "You decide when, where, and how you want to learn. Whether it’s through video calls and meetings  our platform supports flexible arrangements that fit into your lifestyle.",
    },
    {
      title: "Empower Others While Growing Yourself",
      description: "Sharing your skills not only helps others but also boosts your confidence and deepens your own understanding. Teaching is one of the most powerful ways to learn — and you get to experience it firsthand here.",
    },
    {
      title: "A Safe and Supportive Community",
      description: "We prioritize safety and trust. Every member is verified, and our platform encourages respectful and positive interactions. You can focus on learning and sharing without worrying about scams or unprofessional behavior.",
    },
  ];

  return (
    <div className="relative bg-neutral-1000 overflow-hidden" id="Benefits">
      {/* Animated Gradient Header */}
      <div className="relative h-[300px] w-full overflow-hidden flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/30 via-neutral-1000 to-neutral-1000"
        />

        <motion.h2
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="text-4xl sm:text-5xl md:text-6xl font-bold text-center bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent relative z-10"
        >
          Why Choose Groills?
        </motion.h2>

        <motion.div
          className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          transition={{ duration: 1.5, ease: "backOut" }}
        />
      </div>

      {/* 3D Cards Grid */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 mb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => {
  const isExpanded = expandedCards[index];

  return (
    <CardContainer key={index} className="inter-var">
      <CardBody className="bg-neutral-900/80 max-w-[300px] sm:max-w-[500px] relative group/card border border-neutral-800 hover:border-purple-500/50 rounded-xl p-6 h-full flex flex-col suppress-hover">
        <CardItem
          translateZ="40"
          className="text-xl font-bold text-neutral-200 mb-3"
        >
          {benefit.title}
        </CardItem>
        <CardItem
          as="p"
          translateZ="30"
          className="text-neutral-400 text-sm mt-2 flex-grow"
        >
          {isExpanded
            ? benefit.description
            : benefit.description.split(" ").slice(0, 15).join(" ") + "..."}
        </CardItem>
        <CardItem translateZ="50" className="mt-6">
          <Button
            className="w-full bg-purple-600 hover:bg-purple-700 text-white suppress-hover"
            onClick={() =>
              setExpandedCards((prev: any) => ({
                ...prev,
                [index]: !prev[index],
              }))
            }
          >
            {isExpanded ? "Show less" : "Learn more"}
          </Button>
        </CardItem>
      </CardBody>
    </CardContainer>
  );
})}

        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-center mt-10"
        >
          <Link href="/sign-in">
            <Button
              size="lg"
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 text-lg shadow-lg hover:shadow-purple-500/30 transition-all suppress-hover"
            >
              Start Swapping Skills Now
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}

export default BenefitsSection;
