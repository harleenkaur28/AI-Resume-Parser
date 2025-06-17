"use client";

import { LandingHero } from "@/components/landing-hero";
import { MobileFeatures } from "@/components/features";
import { KnowButton } from "@/components/know-more-button";
import { ColdMailButton } from "@/components/cold-mail-button";
import { HiringAssistantButton } from "@/components/hiring-assistant-button";
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
		</>
	);
}

export default function Home() {
	return (
		<main className="min-h-screen bg-gradient-to-br from-[#222831] via-[#31363F] to-[#222831]">
			<LandingHero />
			<MobileFeatures />
			{ConditionalButtons()}
		</main>
	);
}
