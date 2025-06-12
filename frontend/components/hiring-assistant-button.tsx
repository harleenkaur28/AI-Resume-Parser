"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";

export function HiringAssistantButton() {
	return (
		<div className="fixed bottom-20 left-5 z-50">
			<Link href="/dashboard/hiring-assistant">
				<Button
					size="lg"
					className="bg-[#76ABAE] hover:bg-[#76ABAE]/90 text-white rounded-full shadow-xl p-4 transition-all duration-300 ease-in-out hover:scale-105 flex items-center"
				>
					<Users className="h-6 w-6" />
					<span className="ml-2 hidden sm:inline">Hiring</span>
				</Button>
			</Link>
		</div>
	);
}
