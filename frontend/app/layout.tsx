import "./globals.css";
import type { Metadata } from "next";
import { Comfortaa } from "next/font/google";
import { Navbar } from "@/components/navbar";
import { Toaster } from "@/components/ui/toaster";
import { Providers } from "./providers";

const comfortaa = Comfortaa({ subsets: ["latin"] });

export const metadata: Metadata = {
	title: "TalentSync - AI-Powered Job Matching",
	description:
		"Upload your resume and let AI match you with your perfect role. Powerful insights for job seekers and recruiters alike.",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en" className={comfortaa.className} suppressHydrationWarning>
			<head>
				<meta name="application-name" content="TalentSync AI" />
				<meta name="apple-mobile-web-app-capable" content="yes" />
				<meta name="apple-mobile-web-app-status-bar-style" content="default" />
				<meta name="apple-mobile-web-app-title" content="TalentSync AI" />
				<meta name="format-detection" content="telephone=no" />
				<meta name="mobile-web-app-capable" content="yes" />
				<meta name="theme-color" content="#76ABAE" />
				<link rel="manifest" href="/manifest.json" />
			</head>
			<body className="bg-gradient-to-br from-[#222831] via-[#31363F] to-[#222831]">
				<Providers>
					<Navbar />
					<main className="pt-16">{children}</main>
					<Toaster />
				</Providers>
			</body>
		</html>
	);
}
