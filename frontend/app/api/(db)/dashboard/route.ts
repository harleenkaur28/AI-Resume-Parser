import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface DashboardData {
	user: {
		name: string;
		email: string;
		image?: string;
	};
	stats: {
		totalResumes: number;
		totalColdMails: number;
		totalInterviews: number;
	};
	recentActivity: Array<{
		id: string;
		type: "resume" | "cold_mail" | "interview";
		title: string;
		description: string;
		date: string;
	}>;
	resumes: Array<{
		id: string;
		customName: string;
		uploadDate: string;
		predictedField?: string;
		candidateName?: string;
	}>;
}

export async function GET(request: NextRequest) {
	try {
		// Get session for authentication
		const session = await getServerSession(authOptions);
		if (!session?.user?.email) {
			return NextResponse.json(
				{
					success: false,
					message: "Authentication required",
				},
				{ status: 401 }
			);
		}

		// Get user data
		const user = await prisma.user.findUnique({
			where: { email: session.user.email },
			include: {
				resumes: {
					include: {
						analysis: true,
					},
					orderBy: {
						uploadDate: "desc",
					},
				},
				coldMailRequests: {
					orderBy: {
						createdAt: "desc",
					},
					take: 10,
				},
				interviewRequests: {
					orderBy: {
						createdAt: "desc",
					},
					take: 10,
				},
			},
		});

		if (!user) {
			return NextResponse.json(
				{
					success: false,
					message: "User not found",
				},
				{ status: 404 }
			);
		}

		// Prepare dashboard data
		const dashboardData: DashboardData = {
			user: {
				name: user.name || "User",
				email: user.email || "",
				image: user.image || undefined,
			},
			stats: {
				totalResumes: user.resumes.length,
				totalColdMails: user.coldMailRequests.length,
				totalInterviews: user.interviewRequests.length,
			},
			recentActivity: [
				// Map resumes to activity
				...user.resumes.slice(0, 5).map((resume) => ({
					id: resume.id,
					type: "resume" as const,
					title: "Resume Uploaded",
					description: resume.customName,
					date: resume.uploadDate.toISOString(),
				})),
				// Map cold mail requests to activity
				...user.coldMailRequests.slice(0, 5).map((coldMail) => ({
					id: coldMail.id,
					type: "cold_mail" as const,
					title: "Cold Email Generated",
					description: `Email for ${coldMail.companyName}`,
					date: coldMail.createdAt.toISOString(),
				})),
				// Map interview requests to activity
				...user.interviewRequests.slice(0, 5).map((interview) => ({
					id: interview.id,
					type: "interview" as const,
					title: "Interview Practice",
					description: `${interview.role} at ${interview.companyName}`,
					date: interview.createdAt.toISOString(),
				})),
			]
				.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
				.slice(0, 10),
			resumes: user.resumes.map((resume) => ({
				id: resume.id,
				customName: resume.customName,
				uploadDate: resume.uploadDate.toISOString(),
				predictedField: resume.analysis?.predictedField || undefined,
				candidateName: resume.analysis?.name || undefined,
			})),
		};

		return NextResponse.json({
			success: true,
			data: dashboardData,
		});

	} catch (error) {
		console.error("Dashboard API error:", error);
		
		return NextResponse.json(
			{
				success: false,
				message: "Internal server error occurred while fetching dashboard data",
			},
			{ status: 500 }
		);
	} finally {
		await prisma.$disconnect();
	}
}
