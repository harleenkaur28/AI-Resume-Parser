"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Mail, Users, Zap, Target } from "lucide-react";
import Link from "next/link";

export default function QuickActions() {
	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.6, delay: 0.3 }}
			className="flex flex-wrap justify-center gap-4 mb-12"
		>
			<Link href="/dashboard/cold-mail">
				<Button className="bg-gradient-to-r from-[#76ABAE] to-[#5A8B8F] hover:from-[#5A8B8F] hover:to-[#76ABAE] text-white px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 button-hover">
					<Mail className="h-5 w-5 mr-2" />
					Cold Mail Generator
					<Zap className="h-4 w-4 ml-2" />
				</Button>
			</Link>
			<Link href="/dashboard/hiring-assistant">
				<Button className="bg-gradient-to-r from-[#31363F] to-[#4C566A] hover:from-[#4C566A] hover:to-[#31363F] text-white px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 button-hover border border-slate-600/50">
					<Users className="h-5 w-5 mr-2" />
					Hiring Assistant
					<Target className="h-4 w-4 ml-2" />
				</Button>
			</Link>
		</motion.div>
	);
}
