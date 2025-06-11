import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Navbar } from "@/components/navbar";

const inter = Inter({ subsets: ["latin"] });

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
		<html lang="en" className={inter.className} suppressHydrationWarning>
			<body className="bg-gradient-to-br from-[#222831] via-[#31363F] to-[#222831]">
				<Navbar />
				<main className="pt-16">{children}</main>
			</body>
		</html>
	);
}
