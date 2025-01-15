"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	ArrowLeft,
	Users,
	FileText,
	Briefcase,
	TrendingUp,
} from "lucide-react";
import Link from "next/link";
import {
	AreaChart,
	Area,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
	BarChart,
	Bar,
} from "recharts";

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
				<motion.div
					initial={{ opacity: 0, x: -20 }}
					animate={{ opacity: 1, x: 0 }}
					transition={{ duration: 0.5 }}
				>
					<Link href="/">
						<Button
							variant="ghost"
							className="text-[#EEEEEE] hover:text-[#76ABAE]"
						>
							<ArrowLeft className="mr-2 h-4 w-4" />
							Back to Home
						</Button>
					</Link>
				</motion.div>

				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.8, delay: 0.2 }}
					className="mt-12"
				>
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

					<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
						<Card className="backdrop-blur-lg bg-white/5 border-white/10">
							<CardHeader>
								<CardTitle className="text-[#EEEEEE]">
									Weekly Resume Uploads
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="h-[300px]">
									<ResponsiveContainer width="100%" height="100%">
										<AreaChart data={mockData.weeklyUploads}>
											<defs>
												<linearGradient
													id="colorUploads"
													x1="0"
													y1="0"
													x2="0"
													y2="1"
												>
													<stop
														offset="5%"
														stopColor="#76ABAE"
														stopOpacity={0.8}
													/>
													<stop
														offset="95%"
														stopColor="#76ABAE"
														stopOpacity={0}
													/>
												</linearGradient>
											</defs>
											<CartesianGrid strokeDasharray="3 3" stroke="#EEEEEE20" />
											<XAxis dataKey="name" stroke="#EEEEEE60" />
											<YAxis stroke="#EEEEEE60" />
											<Tooltip
												contentStyle={{
													backgroundColor: "#31363F",
													border: "1px solid #EEEEEE20",
													borderRadius: "8px",
												}}
											/>
											<Area
												type="monotone"
												dataKey="value"
												stroke="#76ABAE"
												fillOpacity={1}
												fill="url(#colorUploads)"
											/>
										</AreaChart>
									</ResponsiveContainer>
								</div>
							</CardContent>
						</Card>

						<Card className="backdrop-blur-lg bg-white/5 border-white/10">
							<CardHeader>
								<CardTitle className="text-[#EEEEEE]">Top Roles</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="h-[300px]">
									<ResponsiveContainer width="100%" height="100%">
										<BarChart data={mockData.topRoles}>
											<CartesianGrid strokeDasharray="3 3" stroke="#EEEEEE20" />
											<XAxis
												dataKey="name"
												stroke="#EEEEEE60"
												angle={-45}
												textAnchor="end"
												height={100}
											/>
											<YAxis stroke="#EEEEEE60" />
											<Tooltip
												contentStyle={{
													backgroundColor: "#31363F",
													border: "1px solid #EEEEEE20",
													borderRadius: "8px",
												}}
											/>
											<Bar dataKey="value" fill="#76ABAE" />
										</BarChart>
									</ResponsiveContainer>
								</div>
							</CardContent>
						</Card>
					</div>
				</motion.div>
			</div>
		</div>
	);
}
