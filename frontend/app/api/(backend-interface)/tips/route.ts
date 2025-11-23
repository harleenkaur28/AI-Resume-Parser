import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

interface Tip {
	category: string;
	advice: string;
}

interface TipsResponse {
	success: boolean;
	message: string;
	data?: {
		resume_tips: Tip[];
		interview_tips: Tip[];
	};
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

		// Get query parameters
		const { searchParams } = new URL(request.url);
		const jobCategory = searchParams.get("job_category");
		const skills = searchParams.get("skills");

		// Validate that at least one parameter is provided
		if (!jobCategory && !skills) {
			return NextResponse.json(
				{
					success: false,
					message: "Please provide either job_category or skills parameter",
				},
				{ status: 400 }
			);
		}

		// Build query parameters for the backend API
		const queryParams = new URLSearchParams();
		if (jobCategory) {
			queryParams.append("job_category", jobCategory);
		}
		if (skills) {
			queryParams.append("skills", skills);
		}

		// Get backend URL from environment variables
		const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000';
		
		console.log(`Fetching tips from: ${backendUrl}/api/v1/generate/tips/?${queryParams.toString()}`);

		// Make request to FastAPI backend
		const backendResponse = await fetch(
			`${backendUrl}/api/v1/generate/tips/?${queryParams.toString()}`,
			{
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
			}
		);

		if (!backendResponse.ok) {
			console.error(
				`Backend request failed: ${backendResponse.status} ${backendResponse.statusText}`
			);
			
			let errorMessage = "Failed to generate career tips";
			try {
				const errorData = await backendResponse.json();
				errorMessage = errorData.message || errorData.detail || errorMessage;
			} catch (e) {
				// Ignore JSON parsing errors for error responses
			}

			return NextResponse.json(
				{
					success: false,
					message: errorMessage,
				},
				{ status: backendResponse.status }
			);
		}

		// Parse response from backend
		const backendData = await backendResponse.json();

		// Transform backend response to match frontend expectations
		const response: TipsResponse = {
			success: true,
			message: "Tips retrieved successfully",
			data: {
				resume_tips: backendData.data?.resume_tips || [],
				interview_tips: backendData.data?.interview_tips || [],
			},
		};

		return NextResponse.json(response);
		
	} catch (error) {
		console.error("Tips API error:", error);
		
		return NextResponse.json(
			{
				success: false,
				message: "Internal server error occurred while generating tips",
			},
			{ status: 500 }
		);
	}
}
