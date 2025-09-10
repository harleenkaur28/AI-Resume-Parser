"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import {
	FileText,
	Users,
	LayoutDashboard,
	LogIn,
	Menu,
	X,
	Info,
	LogOut,
	ChevronLeft,
	ChevronRight,
	Plus,
	Mail,
	MessageSquare,
	Lightbulb,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import MobileBottomNav from "./mobile-bottom-nav";
import { useSidebar } from "./sidebar-provider";

import banner from "@/public/banner-dark.svg";

const navItems = [
	{
		label: "Home",
		href: "/",
		icon: LayoutDashboard,
	},
	{
		label: "About",
		href: "/about",
		icon: Info,
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

const actionItems = [
	{
		label: "Create Resume",
		href: "/pdf-resume",
		icon: Plus,
		description: "Build a professional resume",
	},
	{
		label: "Generate Cold Mails",
		href: "/dashboard/cold-mail",
		icon: Mail,
		description: "Create personalized cold emails",
	},
	{
		label: "Interview Answers",
		href: "/dashboard/hiring-assistant",
		icon: MessageSquare,
		description: "Get AI-powered interview prep",
	},
	{
		label: "Get Suggestions",
		href: "/dashboard/tips",
		icon: Lightbulb,
		description: "Improve your job search",
	},
];

export function Navbar() {
	const pathname = usePathname();
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
	const { isCollapsed, setIsCollapsed } = useSidebar();
	const { data: session, status } = useSession();

	const handleSignOut = async () => {
		await signOut({ callbackUrl: "/" });
	};

	return (
		<>
			{/* Desktop Sidebar */}
			<motion.div
				initial={{ x: -280 }}
				animate={{ x: 0 }}
				className={cn(
					"hidden md:fixed md:inset-y-0 md:left-0 md:z-50 md:flex md:flex-col transition-all duration-300",
					isCollapsed ? "md:w-16" : "md:w-72"
				)}
			>
				<div className="flex flex-col h-full backdrop-blur-xl bg-black/20 border-r border-white/10">
					{/* Header */}
					<div className="flex items-center justify-between p-4 border-b border-white/10">
						{!isCollapsed && (
							<Link href="/" className="flex items-center space-x-3">
								<Image src={banner} alt="TalentSync AI" width={160} />
							</Link>
						)}
						<Button
							variant="ghost"
							size="sm"
							onClick={() => setIsCollapsed(!isCollapsed)}
							className="text-[#EEEEEE]/70 hover:text-[#76ABAE] hover:bg-[#76ABAE]/10 p-2"
						>
							{isCollapsed ? (
								<ChevronRight className="h-4 w-4" />
							) : (
								<ChevronLeft className="h-4 w-4" />
							)}
						</Button>
					</div>

					{/* Navigation */}
					<nav className="flex-1 px-4 py-6 space-y-6">
						{/* Main Navigation */}
						<div className="space-y-2">
							{navItems.map((item) => {
								const isActive = pathname === item.href;
								return (
									<Link
										key={item.href}
										href={item.href}
										className={cn(
											"flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 group",
											isActive
												? "text-[#76ABAE] bg-[#76ABAE]/10 shadow-inner shadow-[#76ABAE]/5"
												: "text-[#EEEEEE]/80 hover:text-[#EEEEEE] hover:bg-white/[0.08]"
										)}
										title={isCollapsed ? item.label : undefined}
									>
										<item.icon className="h-5 w-5 flex-shrink-0" />
										{!isCollapsed && <span>{item.label}</span>}
									</Link>
								);
							})}
						</div>

						{/* Quick Actions */}
						{session && (
							<div className="space-y-3">
								{!isCollapsed && (
									<div className="px-4">
										<h3 className="text-xs font-semibold text-[#EEEEEE]/50 uppercase tracking-wider">
											Quick Actions
										</h3>
									</div>
								)}
								<div className="space-y-1">
									{actionItems.map((item) => {
										const isActive = pathname === item.href;
										return (
											<Link
												key={item.href}
												href={item.href}
												className={cn(
													"flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 group",
													isActive
														? "text-[#76ABAE] bg-[#76ABAE]/10 shadow-inner shadow-[#76ABAE]/5"
														: "text-[#EEEEEE]/70 hover:text-[#EEEEEE] hover:bg-white/[0.08]"
												)}
												title={isCollapsed ? item.label : undefined}
											>
												<item.icon className="h-4 w-4 flex-shrink-0" />
												{!isCollapsed && (
													<div className="flex-1 min-w-0">
														<div className="truncate">{item.label}</div>
														<div className="text-xs text-[#EEEEEE]/40 truncate">
															{item.description}
														</div>
													</div>
												)}
											</Link>
										);
									})}
								</div>
							</div>
						)}
					</nav>

					{/* User Section */}
					<div className="border-t border-white/10 p-4">
						{status === "loading" ? (
							<div className="text-[#EEEEEE]/60 text-sm">Loading...</div>
						) : session ? (
							<div className="space-y-2">
								{/* User Info */}
								<Link href="/account">
									<div
										className={cn(
											"flex items-center space-x-3 p-3 rounded-lg text-[#EEEEEE]/90 hover:text-[#76ABAE] hover:bg-[#76ABAE]/10 cursor-pointer transition-colors",
											isCollapsed && "justify-center"
										)}
									>
										<Avatar
											src={session?.user?.image}
											alt="Profile"
											size="sm"
										/>
										{!isCollapsed && (
											<div className="min-w-0 flex-1">
												<div className="text-sm font-medium truncate">
													{session?.user?.name ||
														session?.user?.email ||
														"Account"}
												</div>
												<div className="text-xs text-[#76ABAE] truncate">
													{(session?.user as any)?.role === "Admin"
														? "Recruiter"
														: (session?.user as any)?.role || "No role"}
												</div>
											</div>
										)}
									</div>
								</Link>

								{/* Dashboard Button */}
								<Link href="/dashboard">
									<Button
										variant="ghost"
										className={cn(
											"w-full text-[#EEEEEE]/90 hover:text-[#76ABAE] hover:bg-[#76ABAE]/10",
											isCollapsed ? "px-2" : "justify-start"
										)}
									>
										<LayoutDashboard className="h-4 w-4" />
										{!isCollapsed && <span className="ml-2">Dashboard</span>}
									</Button>
								</Link>

								{/* Sign Out Button */}
								<Button
									onClick={handleSignOut}
									variant="ghost"
									className={cn(
										"w-full text-[#EEEEEE]/90 hover:text-red-400 hover:bg-red-500/10",
										isCollapsed ? "px-2" : "justify-start"
									)}
								>
									<LogOut className="h-4 w-4" />
									{!isCollapsed && <span className="ml-2">Sign Out</span>}
								</Button>
							</div>
						) : (
							<div className="space-y-2">
								<Link href="/auth">
									<Button
										variant="ghost"
										className={cn(
											"w-full text-[#EEEEEE]/90 hover:text-[#76ABAE] hover:bg-[#76ABAE]/10",
											isCollapsed ? "px-2" : "justify-start"
										)}
									>
										<LogIn className="h-4 w-4" />
										{!isCollapsed && <span className="ml-2">Sign In</span>}
									</Button>
								</Link>
								<Link href="/auth?tab=register">
									<Button
										className={cn(
											"w-full bg-[#76ABAE] hover:bg-[#76ABAE]/90 font-medium shadow-lg shadow-[#76ABAE]/20",
											isCollapsed && "px-2"
										)}
									>
										{isCollapsed ? "+" : "Get Started"}
									</Button>
								</Link>
							</div>
						)}
					</div>
				</div>
			</motion.div>

			{/* Tablet Navigation */}
			<motion.div
				initial={{ y: -100 }}
				animate={{ y: 0 }}
				className="fixed top-0 left-0 right-0 z-40 sm:block md:hidden"
			>
				<div className="backdrop-blur-xl bg-black/20 border-b border-white/10">
					<div className="container mx-auto px-4 sm:px-6">
						<div className="flex items-center justify-between h-16">
							<Link href="/" className="flex items-center space-x-3">
								<Image src={banner} alt="TalentSync AI" width={180} />
							</Link>

							<button
								className="text-[#EEEEEE]"
								onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
							>
								{isMobileMenuOpen ? (
									<X className="h-6 w-6" />
								) : (
									<Menu className="h-6 w-6" />
								)}
							</button>
						</div>

						{/* Tablet Menu */}
						{isMobileMenuOpen && (
							<motion.div
								initial={{ opacity: 0, y: -10 }}
								animate={{ opacity: 1, y: 0 }}
								className="py-4"
							>
								<div className="flex flex-col space-y-3">
									{navItems.map((item) => {
										const isActive = pathname === item.href;
										return (
											<Link
												key={item.href}
												href={item.href}
												onClick={() => setIsMobileMenuOpen(false)}
												className={cn(
													"px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
													isActive
														? "text-[#76ABAE] bg-[#76ABAE]/10"
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

									{/* Quick Actions for Tablet */}
									{session && (
										<>
											<div className="pt-3 border-t border-white/10">
												<div className="px-4 mb-3">
													<h3 className="text-xs font-semibold text-[#EEEEEE]/50 uppercase tracking-wider">
														Quick Actions
													</h3>
												</div>
												{actionItems.map((item) => {
													const isActive = pathname === item.href;
													return (
														<Link
															key={item.href}
															href={item.href}
															onClick={() => setIsMobileMenuOpen(false)}
															className={cn(
																"px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 block",
																isActive
																	? "text-[#76ABAE] bg-[#76ABAE]/10"
																	: "text-[#EEEEEE]/70 hover:text-[#EEEEEE] hover:bg-white/[0.08]"
															)}
														>
															<span className="flex items-center space-x-2.5">
																<item.icon className="h-4 w-4" />
																<div>
																	<div>{item.label}</div>
																	<div className="text-xs text-[#EEEEEE]/40">
																		{item.description}
																	</div>
																</div>
															</span>
														</Link>
													);
												})}
											</div>
										</>
									)}
									<div className="pt-3 flex flex-col space-y-3">
										{session ? (
											<>
												<Link href="/account">
													<div className="px-4 py-2 text-[#EEEEEE]/90 hover:text-[#76ABAE] cursor-pointer transition-colors">
														<div className="text-sm font-medium">
															{session?.user?.name ||
																session?.user?.email ||
																"Account"}
														</div>
														<div className="text-xs text-[#76ABAE]">
															{(session?.user as any)?.role === "Admin"
																? "Recruiter"
																: (session?.user as any)?.role || "No role"}
														</div>
													</div>
												</Link>
												<Link href="/dashboard">
													<Button
														variant="ghost"
														className="w-full text-[#EEEEEE]/90 hover:text-[#76ABAE] hover:bg-[#76ABAE]/10 justify-start"
														onClick={() => setIsMobileMenuOpen(false)}
													>
														<LayoutDashboard className="h-4 w-4 mr-2.5" />
														Dashboard
													</Button>
												</Link>
												<Button
													onClick={handleSignOut}
													variant="ghost"
													className="w-full text-[#EEEEEE]/90 hover:text-red-400 hover:bg-red-500/10 justify-start"
												>
													<LogOut className="h-4 w-4 mr-2.5" />
													Sign Out
												</Button>
											</>
										) : (
											<>
												<Link href="/auth">
													<Button
														variant="ghost"
														className="w-full text-[#EEEEEE]/90 hover:text-[#76ABAE] hover:bg-[#76ABAE]/10"
													>
														<LogIn className="h-4 w-4 mr-2.5" />
														Sign In
													</Button>
												</Link>
												<Link href="/auth?tab=register">
													<Button className="w-full bg-[#76ABAE] hover:bg-[#76ABAE]/90 font-medium">
														Get Started
													</Button>
												</Link>
											</>
										)}
									</div>
								</div>
							</motion.div>
						)}
					</div>
				</div>
			</motion.div>

			{/* Mobile Bottom Navigation */}
			<MobileBottomNav />
		</>
	);
}
