import React from "react";
import { User } from "lucide-react";
import { cn } from "@/lib/utils";

interface AvatarProps {
	src?: string | null;
	alt?: string;
	size?: "sm" | "md" | "lg";
	className?: string;
}

export function Avatar({
	src,
	alt = "Profile",
	size = "md",
	className,
}: AvatarProps) {
	const [imageError, setImageError] = React.useState(false);
	const [isLoading, setIsLoading] = React.useState(true);
	const [retryCount, setRetryCount] = React.useState(0);

	React.useEffect(() => {
		if (src && process.env.NODE_ENV === "development") {
			console.log("Avatar src:", src);
		}
	}, [src]);

	// Reset states when src changes
	React.useEffect(() => {
		setImageError(false);
		setIsLoading(true);
		setRetryCount(0);
	}, [src]);

	const sizeClasses = {
		sm: "w-6 h-6",
		md: "w-8 h-8",
		lg: "w-16 h-16",
	};

	const iconSizes = {
		sm: "h-3 w-3",
		md: "h-4 w-4",
		lg: "h-8 w-8",
	};

	// Handle Google profile image URLs with proxy to avoid CORS and rate limiting
	const getOptimizedImageUrl = (url: string, useProxy: boolean = true) => {
		if (url.includes("googleusercontent.com") || url.includes("github.com")) {
			if (useProxy) {
				// Use our proxy API to avoid CORS and rate limiting issues
				return `/api/proxy-image?url=${encodeURIComponent(url)}`;
			} else {
				// Direct URL as fallback
				return url;
			}
		}
		return url;
	};

	const handleImageError = () => {
		if (
			retryCount < 2 &&
			src &&
			(src.includes("googleusercontent.com") || src.includes("github.com"))
		) {
			// Try direct URL if proxy fails
			setRetryCount((prev) => prev + 1);
			setIsLoading(true);
			// Force re-render with different URL
			setTimeout(() => {
				setIsLoading(false);
			}, 500);
		} else {
			setImageError(true);
			setIsLoading(false);
		}
	};

	if (!src || imageError) {
		return (
			<div
				className={cn(
					"rounded-full bg-[#76ABAE]/20 border-2 border-[#76ABAE]/30 flex items-center justify-center",
					sizeClasses[size],
					className
				)}
			>
				<User className={cn("text-[#76ABAE]", iconSizes[size])} />
			</div>
		);
	}

	return (
		<div className={cn("relative", sizeClasses[size], className)}>
			{isLoading && (
				<div
					className={cn(
						"absolute inset-0 rounded-full bg-[#76ABAE]/10 border-2 border-[#76ABAE]/30 flex items-center justify-center animate-pulse",
						sizeClasses[size]
					)}
				>
					<User className={cn("text-[#76ABAE]/50", iconSizes[size])} />
				</div>
			)}
			<img
				key={`${src}-${retryCount}`} // Force re-render on retry
				src={getOptimizedImageUrl(src, retryCount === 0)}
				alt={alt}
				className={cn(
					"rounded-full border-2 border-[#76ABAE]/30 object-cover transition-opacity duration-200",
					sizeClasses[size],
					isLoading ? "opacity-0" : "opacity-100"
				)}
				onLoad={() => setIsLoading(false)}
				onError={handleImageError}
			/>
		</div>
	);
}
