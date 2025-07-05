"use client";

import { FileText } from "lucide-react";
import Link from "next/link";

export function PdfResumeButton() {
	return (
		<Link href="/pdf-resume">
			<div className="fixed bottom-36 left-5 z-50">
				<div className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer group">
					<div className="flex items-center space-x-2">
						<FileText className="h-6 w-6" />
						<span className="font-medium hidden sm:inline">PDF Resume</span>
					</div>
				</div>
			</div>
		</Link>
	);
}
