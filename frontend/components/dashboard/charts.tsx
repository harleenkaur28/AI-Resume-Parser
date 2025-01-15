"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

type ChartData = {
	weeklyUploads: Array<{ name: string; value: number }>;
	topRoles: Array<{ name: string; value: number }>;
};

export function DashboardCharts({ data }: { data: ChartData }) {
	return (
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
							<AreaChart
								data={data.weeklyUploads}
								margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
							>
								{/* ...existing chart configuration... */}
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
							<BarChart
								data={data.topRoles}
								margin={{ top: 10, right: 30, left: 20, bottom: 60 }}
							>
								{/* ...existing chart configuration... */}
							</BarChart>
						</ResponsiveContainer>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
