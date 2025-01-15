import { Card, CardContent } from "@/components/ui/card";
import { Users, FileText, Briefcase, TrendingUp } from "lucide-react";
import {
	AnimatedBackButton,
	AnimatedContent,
} from "@/components/dashboard/animated-section";
import { DashboardCharts } from "@/components/dashboard/charts";

const mockData = {
	weeklyUploads: [
		{ name: "Mon", value: 12 },
		{ name: "Tue", value: 19 },
		{ name: "Wed", value: 15 },
		{ name: "Thu", value: 25 },
		{ name: "Fri", value: 22 },
		{ name: "Sat", value: 10 },
		{ name: "Sun", value: 8 },
	],
	topRoles: [
		{ name: "Software Engineer", value: 45 },
		{ name: "Data Scientist", value: 35 },
		{ name: "Product Manager", value: 30 },
		{ name: "UX Designer", value: 25 },
		{ name: "DevOps Engineer", value: 20 },
	],
};

const stats = [
	{
		title: "Total Users",
		value: "1,234",
		icon: Users,
		color: "text-[#76ABAE]",
	},
	{
		title: "Resumes Processed",
		value: "5,678",
		icon: FileText,
		color: "text-[#76ABAE]",
	},
	{
		title: "Job Matches",
		value: "892",
		icon: Briefcase,
		color: "text-[#76ABAE]",
	},
	{
		title: "Success Rate",
		value: "94%",
		icon: TrendingUp,
		color: "text-[#76ABAE]",
	},
];

export default function AdminDashboard() {
	return (
		<div className="min-h-screen bg-gradient-to-br from-[#222831] via-[#31363F] to-[#222831]">
			<div className="container mx-auto px-4 py-8">
				<AnimatedBackButton />

				<AnimatedContent>
					<h1 className="text-4xl font-bold text-[#EEEEEE] mb-8">
						Admin Dashboard
					</h1>

					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
						{stats.map((stat, index) => (
							<Card
								key={index}
								className="backdrop-blur-lg bg-white/5 border-white/10"
							>
								<CardContent className="flex items-center p-6">
									<stat.icon className={`h-8 w-8 ${stat.color} mr-4`} />
									<div>
										<p className="text-sm font-medium text-[#EEEEEE]/60">
											{stat.title}
										</p>
										<h3 className="text-2xl font-bold text-[#EEEEEE]">
											{stat.value}
										</h3>
									</div>
								</CardContent>
							</Card>
						))}
					</div>

					<DashboardCharts data={mockData} />
				</AnimatedContent>
			</div>
		</div>
	);
}
