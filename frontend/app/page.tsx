import { LandingHero } from "@/components/landing-hero";
import { MobileFeatures } from "@/components/features";
import { KnowButton } from "@/components/know-more-button";
import { ColdMailButton } from "@/components/cold-mail-button";
import { HiringAssistantButton } from "@/components/hiring-assistant-button";

export default function Home() {
	return (
		<main className="min-h-screen bg-gradient-to-br from-[#222831] via-[#31363F] to-[#222831]">
			<LandingHero />
			<MobileFeatures />
			<KnowButton />
			<ColdMailButton />
			<HiringAssistantButton />
		</main>
	);
}
