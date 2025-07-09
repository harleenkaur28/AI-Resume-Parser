import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { InteractiveMenu, InteractiveMenuItem } from "./ui/modern-mobile-menu";
import { Home, FileText, Users, LayoutDashboard, User } from "lucide-react";
import { useSession } from "next-auth/react";
import FloatingActionButton from "./floating-action-button";
import "./ui/modern-mobile-menu.css";

// Extended interface for navigation items with href
interface NavMenuItem extends InteractiveMenuItem {
	href: string;
}

// Extended user type with role
interface ExtendedUser {
	name?: string | null;
	email?: string | null;
	image?: string | null;
	role?: string;
}

const MobileBottomNav: React.FC = () => {
	const pathname = usePathname();
	const router = useRouter();
	const { data: session } = useSession();

	// Define navigation items based on auth status
	const getNavItems = (): NavMenuItem[] => {
		const baseItems: NavMenuItem[] = [
			{ label: "Home", icon: Home, href: "/" },
			{ label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
		];

		if (session) {
			const user = session.user as ExtendedUser;
			return [
				...baseItems,
				{ label: "Account", icon: User, href: "/account" },
				{
					label: user?.role === "Admin" ? "Recruiter" : "Seeker",
					icon: user?.role === "Admin" ? Users : FileText,
					href:
						user?.role === "Admin"
							? "/dashboard/recruiter"
							: "/dashboard/seeker",
				},
			];
		}

		return [
			...baseItems,
			{ label: "Account", icon: User, href: "/account" },
			{ label: "Seekers", icon: FileText, href: "/dashboard/seeker" },
		];
	};

	const navItems = getNavItems();

	// Find active index based on current pathname
	const getActiveIndex = () => {
		const index = navItems.findIndex((item: NavMenuItem) => {
			if (item.href === "/" && pathname === "/") return true;
			if (item.href !== "/" && pathname.startsWith(item.href)) return true;
			return false;
		});
		return index >= 0 ? index : 0;
	};

	// Handle navigation with custom logic
	const handleNavigation = (index: number) => {
		const targetItem = navItems[index];
		if (targetItem?.href) {
			router.push(targetItem.href);
		}
	};

	// Transform items for InteractiveMenu (remove href)
	const menuItems: InteractiveMenuItem[] = navItems.map(({ label, icon }) => ({
		label,
		icon,
	}));

	return (
		<div className="sm:hidden fixed bottom-0 left-0 right-0 z-50">
			<InteractiveMenuWrapper
				items={menuItems}
				activeIndex={getActiveIndex()}
				onItemClick={handleNavigation}
				accentColor="#76ABAE"
			/>
		</div>
	);
};

// Wrapper component to handle the InteractiveMenu with navigation logic
interface InteractiveMenuWrapperProps {
	items: InteractiveMenuItem[];
	activeIndex: number;
	onItemClick: (index: number) => void;
	accentColor: string;
}

const InteractiveMenuWrapper: React.FC<InteractiveMenuWrapperProps> = ({
	items,
	activeIndex,
	onItemClick,
	accentColor,
}) => {
	return (
		<div className="mobile-nav-wrapper">
			<InteractiveMenuWithNavigation
				items={items}
				accentColor={accentColor}
				activeIndex={activeIndex}
				onItemClick={onItemClick}
			/>
		</div>
	);
};

// Extended InteractiveMenu with navigation handling
interface InteractiveMenuWithNavigationProps {
	items: InteractiveMenuItem[];
	accentColor: string;
	activeIndex: number;
	onItemClick: (index: number) => void;
}

const InteractiveMenuWithNavigation: React.FC<
	InteractiveMenuWithNavigationProps
> = ({ items, accentColor, activeIndex, onItemClick }) => {
	const [internalActiveIndex, setInternalActiveIndex] =
		React.useState(activeIndex);

	React.useEffect(() => {
		setInternalActiveIndex(activeIndex);
	}, [activeIndex]);

	const handleItemClick = (index: number) => {
		setInternalActiveIndex(index);
		onItemClick(index);
	};

	const textRefs = React.useRef<(HTMLElement | null)[]>([]);
	const itemRefs = React.useRef<(HTMLButtonElement | null)[]>([]);

	React.useEffect(() => {
		const setLineWidth = () => {
			const activeItemElement = itemRefs.current[internalActiveIndex];
			const activeTextElement = textRefs.current[internalActiveIndex];

			if (activeItemElement && activeTextElement) {
				const textWidth = activeTextElement.offsetWidth;
				activeItemElement.style.setProperty("--lineWidth", `${textWidth}px`);
			}
		};

		setLineWidth();
		window.addEventListener("resize", setLineWidth);
		return () => window.removeEventListener("resize", setLineWidth);
	}, [internalActiveIndex, items]);

	const navStyle = React.useMemo(() => {
		return { "--component-active-color": accentColor } as React.CSSProperties;
	}, [accentColor]);

	// Split items to make space for floating action button in the middle
	const leftItems = items.slice(0, 2);
	const rightItems = items.slice(2);

	return (
		<nav className="menu" role="navigation" style={navStyle}>
			{/* Left side items */}
			{leftItems.map((item, index) => {
				const isActive = index === internalActiveIndex;
				const IconComponent = item.icon;

				return (
					<button
						key={item.label}
						className={`menu__item ${isActive ? "active" : ""}`}
						onClick={() => handleItemClick(index)}
						ref={(el) => (itemRefs.current[index] = el)}
						style={{ "--lineWidth": "0px" } as React.CSSProperties}
					>
						<div className="menu__icon">
							<IconComponent className="icon" />
						</div>
						<strong
							className="menu__text"
							ref={(el) => (textRefs.current[index] = el)}
						>
							{item.label}
						</strong>
					</button>
				);
			})}

			{/* Spacer for floating action button */}
			<div
				className="menu__spacer"
				style={{ minWidth: "80px", flex: "0 0 80px" }}
			>
				<FloatingActionButton />
			</div>

			{/* Right side items */}
			{rightItems.map((item, originalIndex) => {
				const index = originalIndex + 2; // Adjust index for original array
				const isActive = index === internalActiveIndex;
				const IconComponent = item.icon;

				return (
					<button
						key={item.label}
						className={`menu__item ${isActive ? "active" : ""}`}
						onClick={() => handleItemClick(index)}
						ref={(el) => (itemRefs.current[index] = el)}
						style={{ "--lineWidth": "0px" } as React.CSSProperties}
					>
						<div className="menu__icon">
							<IconComponent className="icon" />
						</div>
						<strong
							className="menu__text"
							ref={(el) => (textRefs.current[index] = el)}
						>
							{item.label}
						</strong>
					</button>
				);
			})}
		</nav>
	);
};

export default MobileBottomNav;
