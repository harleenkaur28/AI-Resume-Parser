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

		// Fetch cold mail requests with their responses
		const coldMails = await prisma.coldMailRequest.findMany({
			where: { userId: user.id },
			include: {
				responses: {
					orderBy: { createdAt: "asc" },
				},
			},
			orderBy: { createdAt: "desc" },
		});

		// Transform the data
		const coldMailSessions = coldMails.map((request) => ({
			id: request.id,
			recipientName: request.recipientName,
			recipientDesignation: request.recipientDesignation,
			companyName: request.companyName,
			createdAt: request.createdAt,
			emails: request.responses.map((response) => ({
				id: response.id,
				subject: response.subject,
				body: response.body,
				createdAt: response.createdAt,
			})),
		}));

		return NextResponse.json({
			success: true,
			data: coldMailSessions,
		});
	} catch (error) {
		console.error("Failed to fetch cold mails:", error);
		return NextResponse.json(
			{ success: false, message: "Failed to fetch cold mails" },
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

		// Get cold mail ID from query parameters
		const { searchParams } = new URL(request.url);
		const coldMailId = searchParams.get("id");

		if (!coldMailId) {
			return NextResponse.json(
				{ success: false, message: "Cold mail ID is required" },
				{ status: 400 }
			);
		}

		// Check if cold mail belongs to user
		const coldMail = await prisma.coldMailRequest.findFirst({
			where: {
				id: coldMailId,
				userId: user.id,
			},
		});

		if (!coldMail) {
			return NextResponse.json(
				{ success: false, message: "Cold mail not found or access denied" },
				{ status: 404 }
			);
		}

		// Delete cold mail and its responses (need to delete responses first due to foreign key constraint)
		await prisma.$transaction([
			prisma.coldMailResponse.deleteMany({
				where: { requestId: coldMailId },
			}),
			prisma.coldMailRequest.delete({
				where: { id: coldMailId },
			}),
		]);

		return NextResponse.json({
			success: true,
			message: "Cold mail session deleted successfully",
		});
	} catch (error) {
		console.error("Failed to delete cold mail:", error);
		return NextResponse.json(
			{ success: false, message: "Failed to delete cold mail" },
			{ status: 500 }
		);
	}
}
