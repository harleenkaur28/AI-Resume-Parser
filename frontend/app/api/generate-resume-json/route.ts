import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";

// Helper to parse form data
async function parseFormData(request: NextRequest) {
	const formData = await request.formData();
	const resumeId = formData.get("resumeId") as string | null;
	const file = formData.get("file") as File | null;
	const jobTitle = formData.get("job_title") as string | null;
	const companyName = formData.get("company_name") as string | null;
	const companyDetails = formData.get("company_details") as string | null;
	return { resumeId, file, jobTitle, companyName, companyDetails };
}

export async function POST(request: NextRequest) {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.user?.email) {
			return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 });
		}

		const { resumeId, file, jobTitle, companyName, companyDetails } = await parseFormData(request);

		// Fetch resume text from DB if resumeId is provided
		let resumeText = "";
		if (resumeId) {
			const resume = await prisma.resume.findUnique({
				where: { id: resumeId },
				select: { rawText: true },
			});
			if (!resume) {
				return NextResponse.json({ success: false, message: "Resume not found" }, { status: 404 });
			}
			resumeText = resume.rawText || "";
		} else if (file) {
			// Read uploaded file
			const arrayBuffer = await file.arrayBuffer();
			resumeText = Buffer.from(arrayBuffer).toString("utf-8");
		} else {
			return NextResponse.json({ success: false, message: "No resume provided" }, { status: 400 });
		}

		const pythonApiUrl = "http://localhost:8000/api/v1/resume/generate-json/";

		const backendFormData = new FormData();
		backendFormData.append("resume_text", resumeText);
		if (jobTitle) backendFormData.append("job_title", jobTitle);
		if (companyName) backendFormData.append("company_name", companyName);
		if (companyDetails) backendFormData.append("company_details", companyDetails);
		if (session.user.name) backendFormData.append("user_name", session.user.name);
		if (session.user.email) backendFormData.append("user_email", session.user.email);

		const pythonResponse = await fetch(pythonApiUrl, {
			method: "POST",
			body: backendFormData,
		});

		if (!pythonResponse.ok) {
			const errorText = await pythonResponse.text();
			console.error("Python backend error:", errorText);
			return NextResponse.json(
				{ success: false, message: "Failed to generate resume JSON from backend" },
				{ status: 500 }
			);
		}

		const generatedResumeJson = await pythonResponse.json();

		return NextResponse.json({ success: true, data: generatedResumeJson });
	} catch (error) {
		console.error("Failed to generate resume JSON:", error);
		return NextResponse.json({ success: false, message: "Failed to generate resume JSON" }, { status: 500 });
	}
} 