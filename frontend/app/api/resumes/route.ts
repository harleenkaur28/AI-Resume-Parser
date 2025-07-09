import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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

		// Fetch resumes based on user role
		let resumes;
		if (user.role?.name === "admin" || user.role?.name === "recruiter") {
			// Admins and recruiters can see all resumes that are marked as showInCentral
			resumes = await prisma.resume.findMany({
				where: {
					showInCentral: true,
				},
				include: {
					analysis: {
						select: {
							id: true,
							name: true,
							email: true,
							predictedField: true,
							uploadedAt: true,
						},
					},
					user: {
						select: {
							id: true,
							name: true,
							email: true,
						},
					},
				},
				orderBy: {
					uploadDate: "desc",
				},
			});
		} else {
			// Regular users can only see their own resumes
			resumes = await prisma.resume.findMany({
				where: {
					userId: user.id,
				},
				include: {
					analysis: {
						select: {
							id: true,
							name: true,
							email: true,
							predictedField: true,
							uploadedAt: true,
						},
					},
				},
				orderBy: {
					uploadDate: "desc",
				},
			});
		}

		return NextResponse.json({
			success: true,
			data: resumes,
		});
	} catch (error) {
		console.error("Error fetching resumes:", error);
		return NextResponse.json(
			{
				success: false,
				message: "Internal server error",
			},
			{ status: 500 }
		);
	}
}

export async function DELETE(request: NextRequest) {
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

		// Get resume ID from query parameters
		const { searchParams } = new URL(request.url);
		const resumeId = searchParams.get("id");

		if (!resumeId) {
			return NextResponse.json(
				{
					success: false,
					message: "Resume ID is required",
				},
				{ status: 400 }
			);
		}

		// Verify the resume belongs to the user
		const user = await prisma.user.findUnique({
			where: { email: session.user.email },
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

		// Check if resume exists and belongs to user
		const resume = await prisma.resume.findFirst({
			where: {
				id: resumeId,
				userId: user.id,
			},
			include: {
				analysis: true,
			},
		});

		if (!resume) {
			return NextResponse.json(
				{
					success: false,
					message: "Resume not found or access denied",
				},
				{ status: 404 }
			);
		}

		// Delete the resume and related analysis in a transaction
		await prisma.$transaction(async (tx) => {
			// First delete the analysis if it exists
			if (resume.analysis) {
				await tx.analysis.delete({
					where: { resumeId: resumeId },
				});
			}
			
			// Then delete the resume
			await tx.resume.delete({
				where: { id: resumeId },
			});
		});

		return NextResponse.json({
			success: true,
			message: "Resume deleted successfully",
		});

	} catch (error) {
		console.error("Resume delete API error:", error);
		
		return NextResponse.json(
			{
				success: false,
				message: "Internal server error occurred while deleting resume",
			},
			{ status: 500 }
		);
	} finally {
		await prisma.$disconnect();
	}
}

export async function PATCH(request: NextRequest) {
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

		// Get resume ID from query parameters
		const { searchParams } = new URL(request.url);
		const resumeId = searchParams.get("id");

		if (!resumeId) {
			return NextResponse.json(
				{
					success: false,
					message: "Resume ID is required",
				},
				{ status: 400 }
			);
		}

		// Parse request body
		const body = await request.json();
		const { customName } = body;

		if (!customName || customName.trim().length === 0) {
			return NextResponse.json(
				{
					success: false,
					message: "Custom name is required",
				},
				{ status: 400 }
			);
		}

		// Verify the resume belongs to the user
		const user = await prisma.user.findUnique({
			where: { email: session.user.email },
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

		// Check if resume exists and belongs to user
		const resume = await prisma.resume.findFirst({
			where: {
				id: resumeId,
				userId: user.id,
			},
		});

		if (!resume) {
			return NextResponse.json(
				{
					success: false,
					message: "Resume not found or access denied",
				},
				{ status: 404 }
			);
		}

		// Update the resume name
		const updatedResume = await prisma.resume.update({
			where: { id: resumeId },
			data: { customName: customName.trim() },
		});

		return NextResponse.json({
			success: true,
			message: "Resume renamed successfully",
			data: {
				id: updatedResume.id,
				customName: updatedResume.customName,
			},
		});

	} catch (error) {
		console.error("Resume rename API error:", error);
		
		return NextResponse.json(
			{
				success: false,
				message: "Internal server error occurred while renaming resume",
			},
			{ status: 500 }
		);
	} finally {
		await prisma.$disconnect();
	}
}
