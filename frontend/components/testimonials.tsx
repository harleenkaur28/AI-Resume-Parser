"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Software Engineer",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400",
    quote: "Found my dream job through this platform. The AI insights were spot on!"
  },
  {
    name: "James Wilson",
    role: "HR Manager",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400",
    quote: "Revolutionized our hiring process. We've found amazing talent efficiently."
  },
  {
    name: "Priya Patel",
    role: "Product Designer",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400",
    quote: "The resume insights helped me highlight my best skills. Highly recommend!"
  }
];

export function Testimonials() {
  return (
    <section className="py-20 relative">
      <div className="container mx-auto px-4">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-4xl font-bold text-center text-[#EEEEEE] mb-16"
        >
          Success Stories
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              className="backdrop-blur-lg bg-white/5 rounded-xl p-6 border border-white/10"
            >
              <div className="flex items-center mb-4">
                <Image
                  src={testimonial.image}
                  alt={testimonial.name}
                  width={50}
                  height={50}
                  className="rounded-full"
                />
                <div className="ml-4">
                  <h3 className="text-[#EEEEEE] font-semibold">{testimonial.name}</h3>
                  <p className="text-[#76ABAE]">{testimonial.role}</p>
                </div>
              </div>
              <p className="text-[#EEEEEE]/80 italic">"{testimonial.quote}"</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}