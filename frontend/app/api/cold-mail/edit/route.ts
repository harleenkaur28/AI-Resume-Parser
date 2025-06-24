import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
	try {
		const session = await getServerSession(authOptions);
		if (!session || !session.user || !(session.user as any).id) {
			return NextResponse.json(
				{ success: false, message: "Unauthorized" },
				{ status: 401 }
			);
		}
		const userId = (session.user as any).id;

		const data = await req.formData();

		const resumeId = data.get("resumeId") as string | null;
		const resumeFile = data.get("file") as File | null;
		const customDraft = data.get("custom_draft") as string | null;
		const editInstructions = data.get("edit_instructions") as string | null;
		const generatedEmailBody = data.get("generated_email_body") as string | null;
		const editInscription = data.get("edit_inscription") as string | null;

		let resumeText: string | null = null;

		// Handle resume if provided
		if (resumeId) {
			const resume = await prisma.resume.findUnique({
				where: { id: resumeId, userId: userId },
			});
			if (!resume) {
				return NextResponse.json(
					{ success: false, message: "Resume not found" },
					{ status: 404 }
				);
			}
			resumeText = resume.rawText;
		} else if (resumeFile) {
			resumeText = await resumeFile.text();
		}

		const backendFormData = new FormData();

		// Add resume if available
		if (resumeText) {
			const resumeBlob = new Blob([resumeText], { type: "text/plain" });
			backendFormData.append("file", resumeBlob, "resume.txt");
		}

		// Determine the email content to edit
		let emailContentToEdit = "";
		let instructions = "";

		if (customDraft) {
			// Custom draft mode - use the provided draft
			emailContentToEdit = customDraft;
			instructions = editInstructions || "";
		} else if (generatedEmailBody) {
			// Edit existing generated email
			emailContentToEdit = generatedEmailBody;
			instructions = editInscription || "";
		} else {
			return NextResponse.json(
				{ success: false, message: "No email content provided for editing" },
				{ status: 400 }
			);
		}

		// Add the email content and instructions
		backendFormData.append("generated_email_body", emailContentToEdit);
		backendFormData.append("edit_inscription", instructions);

		// Append other fields from the original form data
		data.forEach((value, key) => {
			if (key !== "file" && key !== "resumeId" && key !== "custom_draft" && key !== "edit_instructions") {
				backendFormData.append(key, value);
			}
		});

		// Add empty subject if not provided (for custom draft mode)
		if (!data.get("generated_email_subject")) {
			backendFormData.append("generated_email_subject", "");
		}

		const pythonApiUrl = "http://localhost:8000/api/v1/cold-mail/editor/";
		const response = await fetch(pythonApiUrl, {
			method: "POST",
			body: backendFormData,
		});

		if (!response.ok) {
			const errorBody = await response.text();
			console.error("Python backend error:", errorBody);
			return NextResponse.json(
				{
					success: false,
					message: `Error from external service: ${response.statusText}`,
				},
				{ status: response.status }
			);
		}

		const result = await response.json();

		if (!result.success) {
			return NextResponse.json(
				{
					success: false,
					message:
						result.message || "Failed to edit email from external service",
				},
				{ status: 400 }
			);
		}

		const mailData = result.data || result;
		const { subject, body } = mailData;

		if (!subject || !body) {
			console.error(
				"Python backend response missing 'subject' or 'body':",
				result
			);
			return NextResponse.json(
				{
					success: false,
					message:
						"Invalid response from external service: missing subject or body.",
				},
				{ status: 500 }
			);
		}

		const coldMailRequestId = data.get("cold_mail_request_id") as string | null;

		let newRequestId = coldMailRequestId;
		let newResponseId;

		if (coldMailRequestId) {
			// Existing request, just add a new response
			const newResponse = await prisma.coldMailResponse.create({
				data: {
					subject,
					body,
					requestId: coldMailRequestId,
				},
			});
			newResponseId = newResponse.id;
		} else {
			// New request, create new request and response
			const newRequest = await prisma.coldMailRequest.create({
				data: {
					userId: userId,
					recipientName: data.get("recipient_name") as string,
					recipientDesignation: data.get("recipient_designation") as string,
					companyName: data.get("company_name") as string,
					senderName: data.get("sender_name") as string,
					senderRoleOrGoal: data.get("sender_role_or_goal") as string,
					keyPoints: data.get("key_points_to_include") as string,
					additionalInfo: data.get("additional_info_for_llm") as string,
					companyUrl: data.get("company_url") as string | null,
				},
			});
			newRequestId = newRequest.id;

			const newResponse = await prisma.coldMailResponse.create({
				data: {
					subject,
					body,
					requestId: newRequestId,
				},
			});
			newResponseId = newResponse.id;
		}

		return NextResponse.json({
			success: true,
			data: {
				subject,
				body,
				requestId: newRequestId,
				responseId: newResponseId,
			},
		});
	} catch (error) {
		console.error("Error editing cold mail:", error);
		return NextResponse.json(
			{ success: false, message: "Internal server error" },
			{ status: 500 }
		);
	}
}
