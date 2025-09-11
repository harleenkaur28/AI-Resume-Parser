"use client";

import { LandingHero } from "@/components/landing-hero";
import { MobileFeatures } from "@/components/features";
import {
	ValueProps,
	HowItWorks,
	Testimonials,
	FinalCTA,
} from "@/components/landing";
import { KnowButton } from "@/components/know-more-button";
import { ColdMailButton } from "@/components/cold-mail-button";
import { HiringAssistantButton } from "@/components/hiring-assistant-button";
import { LinkedInPostsButton } from "@/components/linkedin-posts-button";
import { useEffect, useState } from "react";

function useIsMobile() {
	const [isMobile, setIsMobile] = useState(false);

	useEffect(() => {
		const checkMobile = () => setIsMobile(window.innerWidth <= 768);
		checkMobile();
		window.addEventListener("resize", checkMobile);
		return () => window.removeEventListener("resize", checkMobile);
	}, []);

	return isMobile;
}

function ConditionalButtons() {
	const isMobile = useIsMobile();
	if (isMobile) return null;
	return (
		<>
			<KnowButton />
			<ColdMailButton />
			<HiringAssistantButton />
			<LinkedInPostsButton />
		</>
	);
}

export default function Home() {
	return (
		<main className="min-h-screen flex flex-col bg-[#1d2228] relative overflow-hidden">
			{/* Ambient background effects */}
			<div className="pointer-events-none absolute inset-0">
				<div className="absolute inset-0 opacity-[0.15] [background:radial-gradient(circle_at_20%_25%,#76ABAE22,transparent_60%),radial-gradient(circle_at_80%_70%,#76ABAE22,transparent_55%)]" />
				<div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:60px_60px] mix-blend-overlay opacity-20" />
			</div>
			<LandingHero />
			<ValueProps />
			<HowItWorks />
			<Testimonials />
			<MobileFeatures />
			<FinalCTA />
			{/* {ConditionalButtons()} */}
		</main>
	);
}
