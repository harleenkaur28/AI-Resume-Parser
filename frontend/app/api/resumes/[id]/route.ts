import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id: resumeId } = await params;
		
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

		if (!resumeId) {
			return NextResponse.json(
				{
					success: false,
					message: "Resume ID is required",
				},
				{ status: 400 }
			);
		}

		// Get the user
		const user = await prisma.user.findUnique({
			where: { email: session.user.email },
			include: {
				role: true,
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

		// Fetch the resume with analysis
		const resume = await prisma.resume.findUnique({
			where: {
				id: resumeId,
			},
			include: {
				analysis: true,
				user: {
					select: {
						id: true,
						name: true,
						email: true,
					},
				},
			},
		});

		if (!resume) {
			return NextResponse.json(
				{
					success: false,
					message: "Resume not found",
				},
				{ status: 404 }
			);
		}

		// Check if the resume belongs to the user or if the user has permission to view it
		// For recruiters/admins, they can view resumes that are marked as showInCentral
		// For regular users, they can only view their own resumes
		const hasPermission =
			resume.userId === user.id ||
			(resume.showInCentral && user.role?.name === "recruiter") ||
			user.role?.name === "admin";

		if (!hasPermission) {
			return NextResponse.json(
				{
					success: false,
					message: "You don't have permission to view this resume",
				},
				{ status: 403 }
			);
		}

		return NextResponse.json({
			success: true,
			data: {
				resume: {
					id: resume.id,
					customName: resume.customName,
					rawText: resume.rawText,
					uploadDate: resume.uploadDate,
					showInCentral: resume.showInCentral,
					user: resume.user,
				},
				analysis: resume.analysis,
			},
		});
	} catch (error) {
		console.error("Error fetching resume:", error);
		return NextResponse.json(
			{
				success: false,
				message: "Internal server error",
			},
			{ status: 500 }
		);
	}
}
