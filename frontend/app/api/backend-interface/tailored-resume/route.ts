import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface TailoredResumeRequest {
  resume_text?: string;
  job_role: string;
  company_name?: string;
  company_website?: string;
  job_description?: string;
}

interface BackendTailoredResumeResponse {
  success: boolean;
  message?: string;
  // Add other fields based on ComprehensiveAnalysisResponse
  [key: string]: any;
}

interface TailoredResumeResponse {
  success: boolean;
  message: string;
  [key: string]: any;
}

function validateTailoredResumeRequest(data: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!data.job_role?.trim()) {
    errors.push("Job role is required");
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const resumeId = formData.get('resumeId') as string | null;
    
    // Extract form fields
    const requestData = {
      job_role: formData.get('job_role') as string,
      company_name: formData.get('company_name') as string,
      company_website: formData.get('company_website') as string,
      job_description: formData.get('job_description') as string,
    };

    console.log('Tailored Resume API - Request data:', { 
      hasFile: !!file, 
      fileName: file?.name, 
      resumeId,
      formData: Object.keys(requestData) 
    });

    // Validate request data
    const validation = validateTailoredResumeRequest(requestData);
    if (!validation.isValid) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Validation failed", 
          errors: validation.errors 
        },
        { status: 400 }
      );
    }

    // Validate resume source
    if (!file && !resumeId) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Either upload a resume file or select an existing resume" 
        },
        { status: 400 }
      );
    }

    if (file && resumeId) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Please either upload a file or select an existing resume, not both" 
        },
        { status: 400 }
      );
    }

    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000';
    let backendResponse: Response;

    try {
      if (file) {
        // Scenario 1: New file upload - use v1 endpoint
        console.log('Tailored Resume API - Using v1 endpoint (file upload)');
        
        const backendFormData = new FormData();
        backendFormData.append('resume_file', file);
        backendFormData.append('job_role', requestData.job_role);
        if (requestData.company_name) {
          backendFormData.append('company_name', requestData.company_name);
        }
        if (requestData.company_website) {
          backendFormData.append('company_website', requestData.company_website);
        }
        if (requestData.job_description) {
          backendFormData.append('job_description', requestData.job_description);
        }

        backendResponse = await fetch(`${backendUrl}/api/v1/resume/tailor`, {
          method: 'POST',
          body: backendFormData,
          signal: AbortSignal.timeout(60000), // 60 second timeout for resume analysis
        });
      } else if (resumeId) {
        // Scenario 2: Use existing resume from database - use v2 endpoint
        console.log('Tailored Resume API - Using v2 endpoint (existing resume)');
        
        // Get the specific resume from database
        const user = await prisma.user.findUnique({
          where: { email: session.user.email },
          include: { role: true }
        });

        if (!user) {
          return NextResponse.json(
            { success: false, message: "User not found" },
            { status: 404 }
          );
        }

        const resume = await prisma.resume.findUnique({
          where: { id: resumeId },
          include: { user: true }
        });

        if (!resume) {
          return NextResponse.json(
            { success: false, message: "Resume not found" },
            { status: 404 }
          );
        }

        // Check if user owns the resume or has admin/recruiter access
        const canAccess = resume.userId === user.id || 
                         user.role?.name === 'Admin' || 
                         user.role?.name === 'Recruiter';

        if (!canAccess) {
          return NextResponse.json(
            { success: false, message: "Access denied to this resume" },
            { status: 403 }
          );
        }

        const resumeText = resume.rawText;
        if (!resumeText || resumeText.trim().length < 100) {
          return NextResponse.json(
            { 
              success: false, 
              message: "Resume text is too short or invalid. Please select a different resume." 
            },
            { status: 400 }
          );
        }

        // Use JSON payload for v2 endpoint
        const payload = {
          resume_text: resumeText,
          job_role: requestData.job_role,
          company_name: requestData.company_name || null,
          company_website: requestData.company_website || null,
          job_description: requestData.job_description || null,
        };

        backendResponse = await fetch(`${backendUrl}/api/v2/resume/tailor`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout(60000), // 60 second timeout for resume analysis
        });
      } else {
        // This should not happen due to earlier validation, but handle it just in case
        return NextResponse.json(
          { 
            success: false, 
            message: "Invalid request: no resume source provided" 
          },
          { status: 400 }
        );
      }

      if (!backendResponse.ok) {
        const errorText = await backendResponse.text();
        console.error('Tailored Resume API - Backend error:', {
          status: backendResponse.status,
          statusText: backendResponse.statusText,
          contentType: backendResponse.headers.get('content-type'),
          error: errorText.substring(0, 300) + (errorText.length > 300 ? '...' : '')
        });
        
        let errorMessage = "Failed to generate tailored resume";
        
        // Try to parse JSON error response
        try {
          const errorData = JSON.parse(errorText);
          if (errorData.detail?.message) {
            errorMessage = errorData.detail.message;
          } else if (errorData.message) {
            errorMessage = errorData.message;
          } else if (errorData.detail) {
            errorMessage = typeof errorData.detail === 'string' ? errorData.detail : JSON.stringify(errorData.detail);
          }
        } catch (e) {
          // If JSON parsing fails, check if it's HTML and extract meaningful info
          if (errorText.includes('<html') || errorText.includes('<!DOCTYPE')) {
            // It's likely an HTML error page
            const titleMatch = errorText.match(/<title>(.*?)<\/title>/i);
            const h1Match = errorText.match(/<h1[^>]*>(.*?)<\/h1>/i);
            
            if (titleMatch?.[1]) {
              errorMessage = `Server error: ${titleMatch[1].replace(/<[^>]*>/g, '').trim()}`;
            } else if (h1Match?.[1]) {
              errorMessage = `Server error: ${h1Match[1].replace(/<[^>]*>/g, '').trim()}`;
            } else {
              errorMessage = "Server returned an HTML error page";
            }
          } else if (errorText.length > 0 && errorText.length < 200) {
            // If it's short text, use it directly
            errorMessage = `Server error: ${errorText.trim()}`;
          }
          // Otherwise use default error message
        }

        return NextResponse.json(
          { 
            success: false, 
            message: errorMessage,
            debug: process.env.NODE_ENV === 'development' ? {
              status: backendResponse.status,
              statusText: backendResponse.statusText,
              contentType: backendResponse.headers.get('content-type'),
              responsePreview: errorText.substring(0, 200)
            } : undefined
          },
          { status: backendResponse.status }
        );
      }

      // Try to parse JSON response, handle non-JSON responses gracefully
      let backendData: BackendTailoredResumeResponse;
      const responseText = await backendResponse.text();
      
      try {
        backendData = JSON.parse(responseText);
        console.log('Tailored Resume API - Backend response:', { 
          success: backendData.success !== false,
          hasData: Object.keys(backendData).length > 0
        });
      } catch (jsonError) {
        console.error('Tailored Resume API - JSON parsing error:', {
          jsonError: jsonError instanceof Error ? jsonError.message : 'Unknown',
          responseText: responseText.substring(0, 500) + (responseText.length > 500 ? '...' : ''),
          contentType: backendResponse.headers.get('content-type')
        });
        
        // Return a user-friendly error when backend returns non-JSON
        return NextResponse.json(
          { 
            success: false, 
            message: "The resume analysis service returned an invalid response. Please try again or contact support if the issue persists.",
            debug: process.env.NODE_ENV === 'development' ? {
              responseText: responseText.substring(0, 200),
              contentType: backendResponse.headers.get('content-type')
            } : undefined
          },
          { status: 502 }
        );
      }

      // Optional: Store tailored resume request in database for history/analytics
      try {
        const user = await prisma.user.findUnique({
          where: { email: session.user.email }
        });

        if (user) {
          // You can add a TailoredResumeRequest model to your Prisma schema if needed
          // await prisma.tailoredResumeRequest.create({
          //   data: {
          //     userId: user.id,
          //     jobRole: requestData.job_role,
          //     companyName: requestData.company_name,
          //     companyWebsite: requestData.company_website,
          //     jobDescription: requestData.job_description,
          //     resumeId: resumeId || null,
          //   }
          // });
        }
      } catch (dbError) {
        console.error('Tailored Resume API - Database error (non-critical):', dbError);
        // Don't fail the request if database logging fails
      }

      // Return the backend response (backendData may contain success field)
      return NextResponse.json(backendData);

    } catch (fetchError) {
      console.error('Tailored Resume API - Fetch error:', fetchError);
      
      const message = fetchError instanceof Error && fetchError.name === 'AbortError'
        ? 'Request to backend timed out. The resume analysis is taking longer than expected.'
        : 'Failed to connect to backend service';
      
      return NextResponse.json(
        { success: false, message },
        { status: 503 }
      );
    }

  } catch (error) {
    console.error('Tailored Resume API - Unexpected error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: (error as Error).message || 'Unexpected error occurred'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: "Tailored Resume bridge endpoint",
    endpoints: {
      v1: "/api/v1/resume/tailor (file upload)",
      v2: "/api/v2/resume/tailor (resume text)"
    }
  });
}
