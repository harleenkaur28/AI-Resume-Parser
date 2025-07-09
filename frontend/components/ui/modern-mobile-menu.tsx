import React, { useState, useRef, useEffect, useMemo } from "react";
import {
	Home,
	Briefcase,
	Calendar,
	Shield,
	Settings,
	LucideIcon,
} from "lucide-react";

// Updated interface to use LucideIcon type
export interface InteractiveMenuItem {
	label: string;
	icon: LucideIcon;
}

export interface InteractiveMenuProps {
	items?: InteractiveMenuItem[];
	accentColor?: string;
}

const defaultItems: InteractiveMenuItem[] = [
	{ label: "home", icon: Home },
	{ label: "strategy", icon: Briefcase },
	{ label: "period", icon: Calendar },
	{ label: "security", icon: Shield },
	{ label: "settings", icon: Settings },
];

const defaultAccentColor = "var(--component-active-color-default)";

const InteractiveMenu: React.FC<InteractiveMenuProps> = ({
	items,
	accentColor,
}) => {
	const finalItems = useMemo(() => {
		const isValid =
			items && Array.isArray(items) && items.length >= 2 && items.length <= 5;
		if (!isValid) {
			console.warn(
				"InteractiveMenu: 'items' prop is invalid or missing. Using default items.",
				items
			);
			return defaultItems;
		}
		return items;
	}, [items]);

	const [activeIndex, setActiveIndex] = useState(0);

	useEffect(() => {
		if (activeIndex >= finalItems.length) {
			setActiveIndex(0);
		}
	}, [finalItems, activeIndex]);

	const textRefs = useRef<(HTMLElement | null)[]>([]);
	const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

	useEffect(() => {
		const setLineWidth = () => {
			const activeItemElement = itemRefs.current[activeIndex];
			const activeTextElement = textRefs.current[activeIndex];

			if (activeItemElement && activeTextElement) {
				const textWidth = activeTextElement.offsetWidth;
				activeItemElement.style.setProperty("--lineWidth", `${textWidth}px`);
			}
		};

		setLineWidth();

		window.addEventListener("resize", setLineWidth);
		return () => {
			window.removeEventListener("resize", setLineWidth);
		};
	}, [activeIndex, finalItems]);

	const handleItemClick = (index: number) => {
		setActiveIndex(index);
	};

	const navStyle = useMemo(() => {
		const activeColor = accentColor || defaultAccentColor;
		return { "--component-active-color": activeColor } as React.CSSProperties;
	}, [accentColor]);

	return (
		<nav className="menu" role="navigation" style={navStyle}>
			{finalItems.map((item, index) => {
				const isActive = index === activeIndex;
				const isTextActive = isActive;

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
							className={`menu__text ${isTextActive ? "active" : ""}`}
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

export { InteractiveMenu };
