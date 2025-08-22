// components/Footer.tsx
"use client";

import { motion, Variants } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FaGithub, FaTwitter, FaDiscord, FaLinkedin } from "react-icons/fa";


export default function Footer() {
  const links = [
    { name: "Home", href: "/" },
    { name: "Benefits", href: "#Benefits" },
    { name: "How It Works", href: "#How-it-works" },
    { name: "SignIn", href: "/sign-in" },
    { name: "Contact", href: "#Contact-Us" },
  ];

  const socialLinks = [
    { icon: <FaGithub size={20} />, href: "https://github.com/abhishek0709k" },
    { icon: <FaTwitter size={20} />, href: "https://twitter.com" },
    { icon: <FaDiscord size={20} />, href: "https://discord.com" },
    { icon: <FaLinkedin size={20} />, href: "https://www.linkedin.com/in/vivek-singh-b3221a329/" },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
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
  xMove: Array<number>;
  duration: number;
};


  return (
    <footer className="relative bg-gradient-to-b from-black to-gray-900 border-t border-gray-800 overflow-hidden">
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-12"
        >
          <motion.div variants={itemVariants} className="col-span-2">
            <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-500 mb-4">
              Groills
            </h3>
            <p className="text-gray-400 text-sm">
              Connecting people through skill exchange. Learn, teach, and grow together in our community.
            </p>
          </motion.div>

          {[
            { title: "Product", links: links.slice(0, 3) },
            { title: "Company", links: links.slice(3) },
            { title: "Legal", links: [{ name: "Privacy", href: "/terms-policy" }, { name: "Terms", href: "/terms-policy" }] },
          ].map((section, i) => (
            <motion.div key={i} variants={itemVariants}>
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
                {section.title}
              </h4>
              <ul className="space-y-3">
                {section.links.map((link, j) => (
                  <motion.li
                    key={j}
                    whileHover={{ x: 5 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link
                      href={link.href}
                      className="text-gray-400 hover:text-purple-300 text-sm transition-colors"
                    >
                      {link.name}
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          ))}

          <motion.div variants={itemVariants}>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Connect
            </h4>
            <div className="flex space-x-4">
              {socialLinks.map((social, i) => (
                <motion.a
                  key={i}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ y: -3, scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="text-gray-400 hover:text-purple-300 transition-colors"
                >
                  {social.icon}
                </motion.a>
              ))}
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          viewport={{ once: true }}
          className="pt-8 mt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center"
        >
          <p className="text-gray-500 text-sm mb-4 md:mb-0">
            © {new Date().getFullYear()} Groills. All rights reserved.
          </p>
          <div className="flex space-x-6">
           <Link href={"/terms-policy"}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="text-gray-400 hover:text-white text-sm"
            >
              Privacy Policy
            </motion.button>
           </Link>
           <Link href={"/terms-policy"}>
           <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="text-gray-400 hover:text-white text-sm"
            >
              Terms of Service
            </motion.button>
           </Link>
            
          </div>
        </motion.div>
      </div>
    </footer>
  );
}