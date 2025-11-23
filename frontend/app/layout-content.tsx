"use client";

import { Navbar } from "@/components/navbar";
import { Toaster } from "@/components/ui/toaster";
import { SidebarProvider, useSidebar } from "@/components/sidebar-provider";
import { cn } from "@/lib/utils";

function MainLayout({ children }: { children: React.ReactNode }) {
	const { isCollapsed } = useSidebar();

	return (
		<>
			<Navbar />
			<main
				className={cn(
					"pt-16 sm:pt-16 md:pt-0 transition-all duration-300",
					isCollapsed ? "md:pl-16" : "md:pl-72"
				)}
			>
				{children}
			</main>
			<Toaster />
		</>
	);
}

export function LayoutContent({ children }: { children: React.ReactNode }) {
	return (
		<SidebarProvider>
			<MainLayout>{children}</MainLayout>
		</SidebarProvider>
	);
}
