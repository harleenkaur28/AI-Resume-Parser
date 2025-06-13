import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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
