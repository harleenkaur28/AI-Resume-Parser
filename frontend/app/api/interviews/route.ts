import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
	try {
		const session = await getServerSession(authOptions);

		if (!session?.user?.email) {
			return NextResponse.json(
				{ success: false, message: "Authentication required" },
				{ status: 401 }
			);
		}

		// Get user from database
		const user = await prisma.user.findUnique({
			where: { email: session.user.email },
		});

		if (!user) {
			return NextResponse.json(
				{ success: false, message: "User not found" },
				{ status: 404 }
			);
		}

		// Fetch interview sessions with their answers
		const interviews = await prisma.interviewRequest.findMany({
			where: { userId: user.id },
			include: {
				answers: {
					orderBy: { createdAt: "asc" },
				},
			},
			orderBy: { createdAt: "desc" },
		});

		// Transform the data to include questions from the JSON field
		const interviewSessions = interviews.map((interview) => {
			const questions = Array.isArray(interview.questions) 
				? interview.questions 
				: [];
			
			return {
				id: interview.id,
				role: interview.role,
				companyName: interview.companyName,
				createdAt: interview.createdAt,
				questionsAndAnswers: questions.map((question, index: number) => ({
					question: typeof question === 'string' ? question : String(question),
					answer: interview.answers[index]?.answer || "No answer provided",
				})),
			};
		});

		return NextResponse.json({
			success: true,
			data: interviewSessions,
		});
	} catch (error) {
		console.error("Failed to fetch interviews:", error);
		return NextResponse.json(
			{ success: false, message: "Failed to fetch interviews" },
			{ status: 500 }
		);
	}
}
