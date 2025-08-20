// components/ContactSection.tsx
"use client";

import { motion, useAnimation } from "framer-motion";
import { useForm } from "react-hook-form";
import { FiSend, FiMapPin, FiPhone, FiMail } from "react-icons/fi";
import { useEffect, useRef } from "react";

const ContactSection = () => {
  const { register, handleSubmit, reset } = useForm();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const controls = useAnimation();

  // Dynamic grid animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const gridSize = 40;
    const dots: { x: number; y: number; originX: number; originY: number }[] =
      [];

    // Create grid of dots
    for (let x = 0; x < canvas.width; x += gridSize) {
      for (let y = 0; y < canvas.height; y += gridSize) {
        dots.push({
          x,
          y,
          originX: x,
          originY: y,
        });
      }
    }

    // Mouse position tracking
    let mouseX = 0;
    let mouseY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
      controls.start("hover");
    };

    canvas.addEventListener("mousemove", handleMouseMove);

    // Animation loop
    let animationId: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw connections
      ctx.strokeStyle = "rgba(125, 100, 255, 0.1)";
      ctx.lineWidth = 1;

      for (let i = 0; i < dots.length; i++) {
        const dot = dots[i];

        // Move dots toward mouse
        const dx = mouseX - dot.x;
        const dy = mouseY - dot.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 150) {
          const force = (150 - distance) / 150;
          dot.x += dx * force * 0.05;
          dot.y += dy * force * 0.05;
        } else {
          // Return to original position
          dot.x += (dot.originX - dot.x) * 0.1;
          dot.y += (dot.originY - dot.y) * 0.1;
        }

        // Draw connections to nearby dots
        for (let j = i + 1; j < dots.length; j++) {
          const otherDot = dots[j];
          const dist = Math.sqrt(
            Math.pow(dot.x - otherDot.x, 2) + Math.pow(dot.y - otherDot.y, 2)
          );

          if (dist < 80) {
            ctx.beginPath();
            ctx.moveTo(dot.x, dot.y);
            ctx.lineTo(otherDot.x, otherDot.y);
            ctx.stroke();
          }
        }

        // Draw dot
        ctx.fillStyle = "rgba(150, 120, 255, 0.8)";
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
      canvas.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  const onSubmit = async (data: any) => {
    const response = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        access_key: process.env.NEXT_PUBLIC_WEB3FORM_ACCESS_KEY,
        name: data.name,
        email: data.email,
        message: data.message,
      }),
    });
    const result = await response.json();
    if (result.success) {
      console.log(result);
    }
    reset();
    controls.start("submitted");
  };

  const contactMethods = [
    {
      icon: <FiMapPin className="w-5 h-5" />,
      title: "Our Office",
      description: "123 Skill Street, Tech City",
    },
    {
      icon: <FiPhone className="w-5 h-5" />,
      title: "Phone",
      description: "+1 (555) 123-4567",
    },
    {
      icon: <FiMail className="w-5 h-5" />,
      title: "Email",
      description: "hello@groills.com",
    },
  ];

  return (
    <section className="relative py-20 bg-gray-950 overflow-hidden" id="Contact-Us">
      {/* Interactive grid background */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full opacity-20 pointer-events-none"
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Let's <span className="text-purple-400">Connect</span>
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Reach out to start your skill-swapping journey
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact methods */}
          <div className="space-y-6">
            {contactMethods.map((method, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="flex items-start p-6 bg-gray-900/80 backdrop-blur-sm rounded-xl border border-gray-800 hover:border-purple-400/30 transition-all"
              >
                <div className="flex-shrink-0 p-2 bg-purple-500/10 rounded-lg text-purple-400">
                  {method.icon}
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-white">
                    {method.title}
                  </h3>
                  <p className="mt-1 text-gray-400">{method.description}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Contact form */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="bg-gray-900/80 backdrop-blur-sm p-8 rounded-xl border border-gray-800"
          >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  {...register("name", { required: true })}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-1 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-500 transition-all"
                  placeholder="Adam Singh"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  {...register("email", { required: true })}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-1 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-500 transition-all"
                  placeholder="adam@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Your Message
                </label>
                <textarea
                  rows={4}
                  {...register("message", { required: true })}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-1 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-500 transition-all"
                  placeholder="I'd like to learn more about..."
                ></textarea>
              </div>

              <motion.button
                type="submit"
                className="w-full flex items-center justify-center px-6 py-3.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium rounded-lg hover:shadow-lg hover:shadow-purple-500/20 transition-all"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <FiSend className="mr-2" />
                Send Message
              </motion.button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
