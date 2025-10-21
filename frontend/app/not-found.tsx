"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sparkles, Home, LayoutDashboard } from "lucide-react";

export default function NotFound() {
	return (
		<main className="relative min-h-[calc(100vh-0px)] w-full overflow-hidden">
			{/* Ambient background to match app theme */}
			<div className="pointer-events-none absolute inset-0 -z-10">
				{/* Teal glows */}
				<div className="absolute -top-32 -right-40 w-[38rem] h-[38rem] bg-[#76ABAE]/20 blur-[140px] rounded-full" />
				<div className="absolute -bottom-32 -left-40 w-[32rem] h-[32rem] bg-[#76ABAE]/10 blur-[120px] rounded-full" />
				{/* Radial softness */}
				<div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(118,171,174,0.12),transparent_70%)]" />
				{/* Subtle grid */}
				<div
					className="absolute inset-0 opacity-15 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]"
					style={{
						backgroundImage:
							"linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)",
						backgroundSize: "32px 32px, 32px 32px",
					}}
				/>
			</div>

			<section className="mx-auto flex min-h-[80vh] max-w-5xl flex-col items-center justify-center px-6 text-center">
				{/* Pill */}
				<div className="mb-6 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 ring-1 ring-white/10 backdrop-blur text-xs text-[#EEEEEE]/70">
					<Sparkles className="h-3.5 w-3.5 text-[#76ABAE]" />
					<span>Page not found</span>
				</div>

				{/* 404 mark */}
				<h1 className="relative mb-3 text-7xl sm:text-8xl font-extrabold tracking-tight">
					<span className="bg-clip-text text-transparent bg-gradient-to-b from-[#F5F7F7] via-[#E5EFEF] to-[#76ABAE]">
						404
					</span>
				</h1>

				<p className="mx-auto max-w-2xl text-balance text-lg text-[#EEEEEE]/70 leading-relaxed">
					This page drifted off the TalentSync grid. It may have been moved,
					renamed, or never existed.
				</p>

				{/* CTAs */}
				<div className="mt-8 flex flex-wrap items-center justify-center gap-4">
					<Link href="/">
						<Button
							size="lg"
							className="bg-[#76ABAE] hover:bg-[#76ABAE]/90 text-white min-w-[160px] button-hover"
						>
							<Home className="mr-2 h-4 w-4" /> Go Home
						</Button>
					</Link>
					<Link href="/dashboard">
						<Button
							size="lg"
							variant="outline"
							className="border-white/15 text-[#76ABAE]/90 hover:text-white hover:bg-white/10 min-w-[180px] button-hover"
						>
							<LayoutDashboard className="mr-2 h-4 w-4" /> Open Dashboard
						</Button>
					</Link>
				</div>

				{/* Decorative orbit ring */}
				<div className="pointer-events-none relative mt-14 h-28 w-28">
					<div className="absolute inset-0 animate-[spin_12s_linear_infinite] rounded-full border border-white/10" />
					<div className="absolute left-1/2 top-0 h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-[#76ABAE] shadow-[0_0_18px_#76ABAE]" />
					<div className="absolute bottom-0 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-[#76ABAE]/80 shadow-[0_0_16px_rgba(118,171,174,0.9)]" />
				</div>
			</section>
		</main>
	);
}
