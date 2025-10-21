import { motion, AnimatePresence } from "framer-motion";
import { Loader } from "@/components/ui/loader";

interface PageLoaderProps {
	isPageLoading: boolean;
}

export default function PageLoader({ isPageLoading }: PageLoaderProps) {
	return (
		<AnimatePresence>
			{isPageLoading && (
				<motion.div
					initial={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					className="fixed inset-0 bg-gradient-to-br from-[#222831] via-[#31363F] to-[#222831] flex items-center justify-center z-50"
				>
					<Loader
						variant="pulse"
						size="xl"
						text="Loading PDF Resume Generator..."
					/>
				</motion.div>
			)}
		</AnimatePresence>
	);
}
