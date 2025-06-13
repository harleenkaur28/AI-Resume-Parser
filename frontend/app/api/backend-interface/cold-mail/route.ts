import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface ColdMailRequest {
  resume_text?: string;
  recipient_name: string;
  recipient_designation: string;
  company_name: string;
  sender_name: string;
  sender_role_or_goal: string;
  key_points_to_include: string;
  additional_info_for_llm?: string;
  company_url?: string;
}

interface BackendColdMailResponse {
  success: boolean;
  message: string;
  subject: string;
  body: string;
}

interface ColdMailResponse {
  success: boolean;
  message: string;
  subject: string;
  body: string;
}

// Helper function to validate required fields
function validateColdMailRequest(data: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!data.recipient_name?.trim()) {
    errors.push("Recipient name is required");
  }
  
  if (!data.company_name?.trim()) {
    errors.push("Company name is required");
  }
  
  if (!data.sender_name?.trim()) {
    errors.push("Sender name is required");
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// Helper function to sanitize text content for React rendering
function sanitizeTextForReact(text: string): string {
  if (!text || typeof text !== 'string') {
    return '';
  }
  
  // Remove any potential HTML tags
  const sanitized = text
    .replace(/<[^>]*>/g, '')
    .replace(/&[^;]+;/g, (entity) => {
      const entities: { [key: string]: string } = {
        '&amp;': '&',
        '&lt;': '<',
        '&gt;': '>',
        '&quot;': '"',
        '&#39;': "'",
        '&nbsp;': ' '
      };
      return entities[entity] || entity;
    })
    .trim();
  
  return sanitized;
}

// Helper function to format form data for backend API
function formatForBackend(data: any): ColdMailRequest {
  return {
    resume_text: data.resume_text || '',
    recipient_name: data.recipient_name || '',
    recipient_designation: data.recipient_designation || '',
    company_name: data.company_name || '',
    sender_name: data.sender_name || '',
    sender_role_or_goal: data.sender_role_or_goal || '',
    key_points_to_include: data.key_points_to_include || '',
    additional_info_for_llm: data.additional_info_for_llm || '',
    company_url: data.company_url || ''
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
      recipient_name: formData.get('recipient_name') as string,
      recipient_designation: formData.get('recipient_designation') as string,
      company_name: formData.get('company_name') as string,
      sender_name: formData.get('sender_name') as string,
      sender_role_or_goal: formData.get('sender_role_or_goal') as string,
      key_points_to_include: formData.get('key_points_to_include') as string,
      additional_info_for_llm: formData.get('additional_info_for_llm') as string,
      company_url: formData.get('company_url') as string,
    };

    console.log('Cold Mail API - Request data:', { 
      hasFile: !!file, 
      fileName: file?.name, 
      resumeId,
      formData: Object.keys(requestData) 
    });

    // Validate request data
    const validation = validateColdMailRequest(requestData);
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
        console.log('Cold Mail API - Using v1 endpoint (file upload)');
        
        const backendFormData = new FormData();
        backendFormData.append('file', file);
        backendFormData.append('recipient_name', requestData.recipient_name);
        backendFormData.append('recipient_designation', requestData.recipient_designation);
        backendFormData.append('company_name', requestData.company_name);
        backendFormData.append('sender_name', requestData.sender_name);
        backendFormData.append('sender_role_or_goal', requestData.sender_role_or_goal);
        backendFormData.append('key_points_to_include', requestData.key_points_to_include);
        backendFormData.append('additional_info_for_llm', requestData.additional_info_for_llm || '');
        if (requestData.company_url) {
          backendFormData.append('company_url', requestData.company_url);
        }

        backendResponse = await fetch(`${backendUrl}/api/v1/cold-mail/generator/`, {
          method: 'POST',
          body: backendFormData,
          // Add timeout and other fetch options
          signal: AbortSignal.timeout(30000), // 30 second timeout
        });
      } else if (resumeId) {
        // Scenario 2: Use existing resume from database - use v2 endpoint
        console.log('Cold Mail API - Using v2 endpoint (existing resume)');
        
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

        const backendFormData = new FormData();
        backendFormData.append('resume_text', resumeText);
        backendFormData.append('recipient_name', requestData.recipient_name);
        backendFormData.append('recipient_designation', requestData.recipient_designation);
        backendFormData.append('company_name', requestData.company_name);
        backendFormData.append('sender_name', requestData.sender_name);
        backendFormData.append('sender_role_or_goal', requestData.sender_role_or_goal);
        backendFormData.append('key_points_to_include', requestData.key_points_to_include);
        backendFormData.append('additional_info_for_llm', requestData.additional_info_for_llm || '');
        if (requestData.company_url) {
          backendFormData.append('company_url', requestData.company_url);
        }

        backendResponse = await fetch(`${backendUrl}/api/v2/cold-mail/generator/`, {
          method: 'POST',
          body: backendFormData,
          // Add timeout and other fetch options
          signal: AbortSignal.timeout(30000), // 30 second timeout
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
        console.error('Cold Mail API - Backend error:', {
          status: backendResponse.status,
          statusText: backendResponse.statusText,
          contentType: backendResponse.headers.get('content-type'),
          error: errorText.substring(0, 300) + (errorText.length > 300 ? '...' : '')
        });
        
        let errorMessage = "Failed to generate cold email";
        
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
            subject: "",
            body: "",
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
      let backendData: BackendColdMailResponse;
      const responseText = await backendResponse.text();
      
      try {
        backendData = JSON.parse(responseText);
        console.log('Cold Mail API - Backend response:', { 
          success: backendData.success,
          hasSubject: !!backendData.subject,
          hasBody: !!backendData.body,
          subjectLength: backendData.subject?.length || 0,
          bodyLength: backendData.body?.length || 0
        });
      } catch (jsonError) {
        console.error('Cold Mail API - JSON parsing error:', {
          jsonError: jsonError instanceof Error ? jsonError.message : 'Unknown',
          responseText: responseText.substring(0, 500) + (responseText.length > 500 ? '...' : ''),
          contentType: backendResponse.headers.get('content-type')
        });
        
        // Return a user-friendly error when backend returns non-JSON
        return NextResponse.json(
          { 
            success: false, 
            message: "The email generation service returned an invalid response. Please try again or contact support if the issue persists.",
            subject: "",
            body: "",
            debug: process.env.NODE_ENV === 'development' ? {
              responseText: responseText.substring(0, 200),
              contentType: backendResponse.headers.get('content-type')
            } : undefined
          },
          { status: 502 }
        );
      }

      // Validate backend response
      if (!backendData.subject || !backendData.body) {
        console.error('Cold Mail API - Invalid backend response:', backendData);
        return NextResponse.json(
          { 
            success: false, 
            message: "Invalid response from email generation service",
            subject: "",
            body: ""
          },
          { status: 500 }
        );
      }

      // Sanitize the response for React rendering
      const sanitizedSubject = sanitizeTextForReact(backendData.subject);
      const sanitizedBody = sanitizeTextForReact(backendData.body);

      // Optional: Store cold mail request in database for history/analytics
      try {
        // Get user info for database storage
        const user = await prisma.user.findUnique({
          where: { email: session.user.email }
        });

        if (user) {
          await prisma.coldMailRequest.create({
            data: {
              userId: user.id,
              recipientName: requestData.recipient_name,
              recipientDesignation: requestData.recipient_designation,
              companyName: requestData.company_name,
              senderName: requestData.sender_name,
              senderRoleOrGoal: requestData.sender_role_or_goal,
              keyPoints: requestData.key_points_to_include,
              additionalInfo: requestData.additional_info_for_llm,
              companyUrl: requestData.company_url,
            }
          });

          // Store the response separately
          const coldMailRequest = await prisma.coldMailRequest.findFirst({
            where: { userId: user.id },
            orderBy: { createdAt: 'desc' }
          });

          if (coldMailRequest) {
            await prisma.coldMailResponse.create({
              data: {
                requestId: coldMailRequest.id,
                subject: sanitizedSubject,
                body: sanitizedBody,
              }
            });
          }
        }
      } catch (dbError) {
        console.error('Cold Mail API - Database error (non-critical):', dbError);
        // Continue processing even if DB save fails
      }

      const response: ColdMailResponse = {
        success: true,
        message: "Cold email generated successfully",
        subject: sanitizedSubject,
        body: sanitizedBody
      };

      console.log('Cold Mail API - Sending response:', { 
        success: response.success,
        subjectLength: response.subject.length,
        bodyLength: response.body.length
      });

      return NextResponse.json(response);

    } catch (fetchError) {
      console.error('Cold Mail API - Fetch error:', fetchError);
      
      let errorMessage = "Failed to connect to email generation service";
      
      if (fetchError instanceof Error) {
        if (fetchError.name === 'AbortError') {
          errorMessage = "Request timed out. The email generation service took too long to respond.";
        } else if (fetchError.message.includes('ECONNREFUSED') || fetchError.message.includes('ENOTFOUND')) {
          errorMessage = "Cannot connect to email generation service. Please try again later.";
        } else if (fetchError.message.includes('NetworkError') || fetchError.message.includes('Failed to fetch')) {
          errorMessage = "Network error occurred. Please check your connection and try again.";
        } else {
          errorMessage = `Connection error: ${fetchError.message}`;
        }
      }
      
      return NextResponse.json(
        { 
          success: false, 
          message: errorMessage,
          subject: "",
          body: ""
        },
        { status: 503 }
      );
    }

  } catch (error) {
    console.error('Cold Mail API - Unexpected error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: `An unexpected error occurred: ${error instanceof Error ? error.message : 'Unknown error'}`,
        subject: "",
        body: ""
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's resumes for selection
    const resumes = await prisma.resume.findMany({
      where: {
        userId: (session.user as any).id
      },
      select: {
        id: true,
        customName: true,
        uploadDate: true,
        analysis: {
          select: {
            name: true,
            predictedField: true
          }
        }
      },
      orderBy: {
        uploadDate: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      message: 'User resumes retrieved successfully',
      data: {
        resumes: resumes.map(resume => ({
          id: resume.id,
          customName: resume.customName,
          uploadDate: resume.uploadDate,
          candidateName: resume.analysis?.name,
          predictedField: resume.analysis?.predictedField
        })),
        total: resumes.length
      }
    });

  } catch (error) {
    console.error('Error fetching user resumes:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
