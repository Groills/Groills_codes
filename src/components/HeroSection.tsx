'use client'
import { motion } from "framer-motion";
import { TextGenerateEffect } from "./ui/text-generate-effect";
import { BackgroundBeams } from "./ui/background-beams";
import { AnimatedTooltip } from "./ui/animated-tooltip";
import { useEffect, useState } from "react";
import Link from "next/link";
interface User {
  id: number;
  name: string;
  skill: string;
  avatar: string;
}

const HeroSection = () => {
  const users = [
    {
      id: 1,
      name: "Vivek Singh",
      skill: "CEO of Groills",
      avatar: "/vivek-photo.jpg",
    },
    {
      id: 2,
      name: "Raj sir",
      skill: "Mentor",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    },
    {
      id: 3,
      name: "Abhishek Singh",
      skill: "Digital Marketer",
      avatar: "https://randomuser.me/api/portraits/women/68.jpg",
    },
    {
      id: 4,
      name: "MAS Abhijeet",
      skill: "Mentor",
      avatar: "https://randomuser.me/api/portraits/men/75.jpg",
    },
  ];

  const words = `Exchange skills, grow together. No fees, just mutual learning.`;

  const typewriterWords = [
    { text: "Swap" },
    { text: "Skills" },
    { text: "Gain" },
    { text: "Knowledge" },
    { text: "Grow" },
    { text: "Together" },
    { text: "with" },
    { text: "Groills" },
  ];
  // TypewriterEffect Component (included in the same file)
  const TypewriterEffect = ({
    words,
    className,
    cursorClassName,
  }: {
    words: { text: string }[];
    className?: string;
    cursorClassName?: string;
  }) => {
    const [displayText, setDisplayText] = useState("");
    const [currentWordIndex, setCurrentWordIndex] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
      const currentWord = words[currentWordIndex].text;
      const speed = isDeleting ? 50 : 150;

      const timeout = setTimeout(() => {
        if (!isDeleting) {
          setDisplayText(currentWord.substring(0, displayText.length + 1));
          if (displayText === currentWord) {
            setTimeout(() => setIsDeleting(true), 1000);
          }
        } else {
          setDisplayText(currentWord.substring(0, displayText.length - 1));
          if (displayText === "") {
            setIsDeleting(false);
            setCurrentWordIndex((prev) => (prev + 1) % words.length);
          }
        }
      }, speed);

      return () => clearTimeout(timeout);
    }, [displayText, currentWordIndex, isDeleting, words]);

    return (
      <div className={`flex flex-wrap justify-center ${className}`} id="#">
        {displayText.split(" ").map((word, i) => (
          <span key={i} className="mr-2">
            {word}
          </span>
        ))}
        <span className={`inline-block w-1 h-12 sm:h-16 ml-1 ${cursorClassName}`} />
      </div>
    );
  };
  return (
    <>
      

      <section className="relative h-screen overflow-hidden bg-black">
        

        <div className="relative z-10 flex flex-col items-center justify-center h-full px-4 text-center">
         
            <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-8 h-15"
          >
            <TypewriterEffect
              words={typewriterWords}
              className="text-4xl sm:text-5xl md:text-6xl font-bold"
              cursorClassName="bg-pink-500"
            />
          </motion.div>
          

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-2xl mx-auto mb-12"
          >
            <TextGenerateEffect
              words={words}
              className="text-lg text-neutral-400"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4"
          >
            <Link href={"/sign-in"}>
              <button className="px-8 py-3.5 text-lg font-semibold text-white transition-all duration-300 transform bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg hover:scale-105 hover:shadow-xl hover:shadow-purple-500/20">
              Find Your Match
            </button>
            </Link>
            <Link href="#How-it-works" className="px-8 py-3.5 text-lg font-semibold text-white transition-all duration-300 transform border border-neutral-800 rounded-lg hover:bg-neutral-900/50 hover:scale-105">
              How It Works
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-20"
          >
            <h3 className="mb-6 text-sm font-medium tracking-widest text-neutral-600 uppercase">
              Recently Connected
            </h3>
            <div className="flex justify-center">
              <AnimatedTooltip items={users} />
            </div>
          </motion.div>
        </div>

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#262626_1px,transparent_1px),linear-gradient(to_bottom,#262626_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-10" />
      </section>
      <BackgroundBeams />
    </>
  );
};

export default HeroSection;
