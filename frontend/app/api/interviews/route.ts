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
				questionsAndAnswers: questions.map((question) => {
					const questionText = typeof question === 'string' ? question : String(question);
					// Find the corresponding answer by matching the question text
					// Use trim() and toLowerCase() for more robust matching
					const correspondingAnswer = interview.answers.find(
						(answer) => answer.question.trim().toLowerCase() === questionText.trim().toLowerCase()
					);
					
					return {
						question: questionText,
						answer: correspondingAnswer?.answer || "No answer provided",
					};
				}),
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

export async function DELETE(request: NextRequest) {
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

		// Get interview ID from query parameters
		const { searchParams } = new URL(request.url);
		const interviewId = searchParams.get("id");

		if (!interviewId) {
			return NextResponse.json(
				{ success: false, message: "Interview ID is required" },
				{ status: 400 }
			);
		}

		// Check if interview belongs to user
		const interview = await prisma.interviewRequest.findFirst({
			where: {
				id: interviewId,
				userId: user.id,
			},
		});

		if (!interview) {
			return NextResponse.json(
				{ success: false, message: "Interview not found or access denied" },
				{ status: 404 }
			);
		}

		// Delete interview and its answers (need to delete answers first due to foreign key constraint)
		await prisma.$transaction([
			prisma.interviewAnswer.deleteMany({
				where: { requestId: interviewId },
			}),
			prisma.interviewRequest.delete({
				where: { id: interviewId },
			}),
		]);

		return NextResponse.json({
			success: true,
			message: "Interview session deleted successfully",
		});
	} catch (error) {
		console.error("Failed to delete interview:", error);
		return NextResponse.json(
			{ success: false, message: "Failed to delete interview" },
			{ status: 500 }
		);
	}
}
