"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

export function LinkedInPostsButton() {
	return (
		<div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 hidden md:block">
			<Link href="/dashboard/linkedin-posts">
				<Button
					size="lg"
					className="bg-[#76ABAE] hover:bg-[#76ABAE]/90 text-white rounded-full shadow-xl px-6 py-4 transition-all duration-300 ease-in-out hover:scale-105 flex items-center"
				>
					<Sparkles className="h-5 w-5" />
					<span className="ml-2">LinkedIn Posts</span>
				</Button>
			</Link>
		</div>
	);
}
