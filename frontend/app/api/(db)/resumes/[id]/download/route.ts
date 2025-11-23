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

		// Fetch the resume
		const resume = await prisma.resume.findUnique({
			where: {
				id: resumeId,
			},
			include: {
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

		// Check if the user has permission to download this resume
		const hasPermission =
			resume.userId === user.id ||
			(resume.showInCentral && user.role?.name === "recruiter") ||
			user.role?.name === "admin";

		if (!hasPermission) {
			return NextResponse.json(
				{
					success: false,
					message: "You don't have permission to download this resume",
				},
				{ status: 403 }
			);
		}

		// Create a text file with the resume content
		const fileName = `${resume.customName.replace(/[^a-zA-Z0-9]/g, '_')}.txt`;
		
		return new NextResponse(resume.rawText, {
			headers: {
				'Content-Type': 'text/plain',
				'Content-Disposition': `attachment; filename="${fileName}"`,
			},
		});
	} catch (error) {
		console.error("Error downloading resume:", error);
		return NextResponse.json(
			{
				success: false,
				message: "Internal server error",
			},
			{ status: 500 }
		);
	}
}
