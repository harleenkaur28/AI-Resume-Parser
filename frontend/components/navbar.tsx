"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { FileText, Users, LayoutDashboard, LogIn } from "lucide-react";
import { usePathname } from "next/navigation";

const navItems = [
	{
		label: "Home",
		href: "/",
		icon: LayoutDashboard,
	},
	{
		label: "Job Seekers",
		href: "/dashboard/seeker",
		icon: FileText,
	},
	{
		label: "Recruiters",
		href: "/dashboard/recruiter",
		icon: Users,
	},
];

export function Navbar() {
	const pathname = usePathname();

	return (
		<motion.div
			initial={{ y: -100 }}
			animate={{ y: 0 }}
			className="fixed top-0 left-0 right-0 z-50"
		>
			<div className="backdrop-blur-xl bg-black/20 border-b border-white/10">
				<div className="container mx-auto px-6">
					<div className="flex items-center justify-between h-20">
						<Link href="/" className="flex items-center space-x-3">
							<FileText className="h-7 w-7 text-[#76ABAE]" />
							<span className="text-[#EEEEEE] font-bold text-2xl tracking-tight">
								ResumeAI
							</span>
						</Link>

						<nav className="hidden md:flex items-center space-x-2">
							{navItems.map((item) => {
								const isActive = pathname === item.href;
								return (
									<Link
										key={item.href}
										href={item.href}
										className={cn(
											"px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
											isActive
												? "text-[#76ABAE] bg-[#76ABAE]/10 shadow-inner shadow-[#76ABAE]/5"
												: "text-[#EEEEEE]/80 hover:text-[#EEEEEE] hover:bg-white/[0.08]"
										)}
									>
										<span className="flex items-center space-x-2.5">
											<item.icon className="h-4 w-4" />
											<span>{item.label}</span>
										</span>
									</Link>
								);
							})}
						</nav>

						<div className="flex items-center space-x-5">
							<Link href="/auth">
								<Button
									variant="ghost"
									className="text-[#EEEEEE]/90 hover:text-[#76ABAE] hover:bg-[#76ABAE]/10 px-5"
								>
									<LogIn className="h-4 w-4 mr-2.5" />
									Sign In
								</Button>
							</Link>
							<div className="h-5 w-px bg-white/10" />
							<Link href="/auth?tab=register">
								<Button className="bg-[#76ABAE] hover:bg-[#76ABAE]/90 px-6 font-medium shadow-lg shadow-[#76ABAE]/20">
									Get Started
								</Button>
							</Link>
						</div>
					</div>
				</div>
			</div>
		</motion.div>
	);
}
