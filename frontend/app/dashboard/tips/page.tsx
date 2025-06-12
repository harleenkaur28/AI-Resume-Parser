"use client";

import { Suspense } from "react";
import { LoaderOverlay } from "@/components/ui/loader";
import TipsClient from "./TipsClient";

export default function TipsPage() {
	return (
		<Suspense
			fallback={
				<LoaderOverlay
					text="Generating personalized career tips..."
					variant="dots"
					size="xl"
				/>
			}
		>
			<TipsClient />
		</Suspense>
	);
}
