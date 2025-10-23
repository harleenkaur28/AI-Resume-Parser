import React, { useState } from "react";
import {
	Mail,
	MessageSquare,
	Plus,
	X,
	FileText,
	Hash,
	Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

interface FloatingActionButtonProps {
	className?: string;
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
	className,
}) => {
	const [isOpen, setIsOpen] = useState(false);
	const router = useRouter();

	const handleToggle = () => {
		setIsOpen(!isOpen);
	};

	const handleAction = (
		action:
			| "cold-mail"
			| "interview"
			| "pdf-resume"
			| "linkedin"
			| "ai-mock-interview"
	) => {
		setIsOpen(false);
		if (action === "cold-mail") {
			router.push("/dashboard/cold-mail");
		} else if (action === "interview") {
			router.push("/dashboard/hiring-assistant");
		} else if (action === "pdf-resume") {
			router.push("/dashboard/pdf-resume");
		} else if (action === "linkedin") {
			router.push("/dashboard/linkedin-posts");
		} else if (action === "ai-mock-interview") {
			router.push("/dashboard/ai-mock-interviews");
		}
	};

	const subActions = [
		{
			id: "cold-mail",
			label: "Cold Mail",
			icon: Mail,
			color: "hsl(244 84% 60%)",
			action: () => handleAction("cold-mail"),
		},
		{
			id: "interview",
			label: "Interview",
			icon: MessageSquare,
			color: "hsl(142 90% 31%)",
			action: () => handleAction("interview"),
		},
		{
			id: "pdf-resume",
			label: "PDF Resume",
			icon: FileText,
			color: "hsl(24 100% 50%)",
			action: () => handleAction("pdf-resume"),
		},
		{
			id: "linkedin",
			label: "LinkedIn Posts",
			icon: Hash,
			color: "hsl(188 39% 48%)",
			action: () => handleAction("linkedin"),
		},
		{
			id: "ai-mock-interview",
			label: "AI Mock Interview",
			icon: Users,
			color: "hsl(340 82% 52%)",
			action: () => handleAction("ai-mock-interview"),
		},
	];

	return (
		<div
			className={`floating-action-container flex justify-center ${className}`}
		>
			<div className="relative flex justify-center">
				{/* Sub-action buttons */}
				<AnimatePresence>
					{isOpen && (
						<div className="absolute bottom-full mb-4 flex flex-col items-center space-y-3 z-[70]">
							{subActions.map((subAction, index) => (
								<motion.div
									key={subAction.id}
									initial={{ scale: 0, y: 20, opacity: 0 }}
									animate={{
										scale: 1,
										y: 0,
										opacity: 1,
										transition: { delay: index * 0.1 },
									}}
									exit={{
										scale: 0,
										y: 20,
										opacity: 0,
										transition: {
											delay: (subActions.length - 1 - index) * 0.05,
										},
									}}
									className="flex items-center"
								>
									{/* Label */}
									<motion.div
										className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-semibold mr-3 shadow-lg"
										whileHover={{ scale: 1.05 }}
									>
										{subAction.label}
									</motion.div>

									{/* Button */}
									<motion.button
										onClick={subAction.action}
										className="w-12 h-12 rounded-full shadow-lg flex items-center justify-center text-white"
										style={{ backgroundColor: subAction.color }}
										whileHover={{ scale: 1.1 }}
										whileTap={{ scale: 0.95 }}
									>
										<subAction.icon className="w-6 h-6" />
									</motion.button>
								</motion.div>
							))}
						</div>
					)}
				</AnimatePresence>

				{/* Main action button */}
				<motion.button
					onClick={handleToggle}
					className="relative w-16 h-16 bg-[#76ABAE] rounded-full shadow-lg flex items-center justify-center text-white z-[60]"
					whileHover={{ scale: 1.1 }}
					whileTap={{ scale: 0.95 }}
					animate={{ rotate: isOpen ? 45 : 0 }}
					transition={{ duration: 0.3, ease: "easeInOut" }}
				>
					<div className="absolute inset-0 flex items-center justify-center">
						{isOpen ? <X className="w-7 h-7" /> : <Plus className="w-7 h-7" />}
					</div>
				</motion.button>
			</div>
			{/* Backdrop */}
			<AnimatePresence>
				{isOpen && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[50]"
						onClick={() => setIsOpen(false)}
					/>
				)}
			</AnimatePresence>
		</div>
	);
};

export default FloatingActionButton;
