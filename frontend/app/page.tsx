import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/file-upload";
import { LandingHero } from "@/components/landing-hero";
import { Features } from "@/components/features";
import { Testimonials } from "@/components/testimonials";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-[#222831] via-[#31363F] to-[#222831]">
      <LandingHero />
      <Features />
      <Testimonials />
    </main>
  );
}