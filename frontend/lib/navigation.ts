import {
	FileText,
	Users,
	LayoutDashboard,
	Info,
	Plus,
	Mail,
	MessageSquare,
	Lightbulb,
	Hash,
    HomeIcon,
} from "lucide-react";
import { LucideIcon } from "lucide-react";

export interface NavItem {
	label: string;
	href: string;
	icon: LucideIcon;
}

export interface ActionItem extends NavItem {
	description: string;
}

export const navItems: NavItem[] = [
	{
		label: "Home",
		href: "/",
		icon: LayoutDashboard,
	},
	{
		label: "About",
		href: "/about",
		icon: Info,
	},
	{
		label: "Job Seekers",
		href: "/dashboard/seeker",
		icon: FileText,
	},
	{
		label: "Recruiters",
		href: "/dashboard/recruiter",
		icon: Users,
	},
];

export const mobileNavItems: NavItem[] = [
    {
        label: "Home",
        href: "/",
        icon: HomeIcon,
    },
    {
        label: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
    },
    {
        label: "Account",
        href: "/account",
        icon: Users,
    },
    {
        label: "Seeker",
        href: "/dashboard/seeker",
        icon: FileText,
    }
];

export const actionItems: ActionItem[] = [
	{
		label: "Create Resume",
		href: "/dashboard/pdf-resume",
		icon: Plus,
		description: "Build a professional resume",
	},
	{
		label: "Generate Cold Mails",
		href: "/dashboard/cold-mail",
		icon: Mail,
		description: "Create personalized cold emails",
	},
	{
		label: "Interview Answers",
		href: "/dashboard/hiring-assistant",
		icon: MessageSquare,
		description: "Get AI-powered interview prep",
	},
	{
		label: "LinkedIn Posts",
		href: "/dashboard/linkedin-posts",
		icon: Hash,
		description: "Generate LinkedIn content",
	},
	{
		label: "ATS Compatibility",
		href: "/dashboard/ats",
		icon: Lightbulb,
		description: "Improve your job search",
	},
	{
		label: "AI Mock Interviews",
		href: "/dashboard/ai-mock-interviews",
		icon: Users,
		description: "Practice with AI interviews",
	},
];
