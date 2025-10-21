import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface ATSEvaluationRequest {
  resume_text?: string;
  jd_text?: string;
  jd_link?: string;
  company_name?: string;
  company_website?: string;
}

interface BackendATSResponse {
  success: boolean;
  message: string;
  score: number;
  reasons_for_the_score: string[];
  suggestions: string[];
}

interface ATSEvaluationResponse {
  success: boolean;
  message: string;
  score: number;
  reasons_for_the_score: string[];
  suggestions: string[];
}

function validateATSRequest(data: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!data.jd_text?.trim() && !data.jd_link?.trim()) {
    errors.push("Either job description text or job description link is required");
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

function sanitizeTextForReact(text: string): string {
  if (!text || typeof text !== 'string') {
    return '';
  }
  
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
      jd_text: formData.get('jd_text') as string,
      jd_link: formData.get('jd_link') as string,
      company_name: formData.get('company_name') as string,
      company_website: formData.get('company_website') as string,
    };

    console.log('ATS Evaluation API - Request data:', { 
      hasFile: !!file, 
      fileName: file?.name, 
      resumeId,
      hasJdText: !!requestData.jd_text,
      hasJdLink: !!requestData.jd_link,
      companyName: requestData.company_name
    });

    // Validate request data
    const validation = validateATSRequest(requestData);
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
        console.log('ATS Evaluation API - Using v1 endpoint (file upload)');
        
        const backendFormData = new FormData();
        backendFormData.append('resume_file', file);
        
        if (requestData.jd_text) {
          backendFormData.append('jd_text', requestData.jd_text);
        }
        if (requestData.jd_link) {
          backendFormData.append('jd_link', requestData.jd_link);
        }
        if (requestData.company_name) {
          backendFormData.append('company_name', requestData.company_name);
        }
        if (requestData.company_website) {
          backendFormData.append('company_website', requestData.company_website);
        }

        backendResponse = await fetch(`${backendUrl}/api/v1/ats/evaluate`, {
          method: 'POST',
          body: backendFormData,
        });
      } else if (resumeId) {
        // Scenario 2: Use existing resume from database - use v2 endpoint
        console.log('ATS Evaluation API - Using v2 endpoint (existing resume)');
        
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

        // Use v2 endpoint with JSON payload
        const payload = {
          resume_text: resumeText,
          jd_text: requestData.jd_text || undefined,
          jd_link: requestData.jd_link || undefined,
          company_name: requestData.company_name || undefined,
          company_website: requestData.company_website || undefined,
        };

        backendResponse = await fetch(`${backendUrl}/api/v2/ats/evaluate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout(60000), // 60 second timeout for ATS evaluation
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
        console.error('ATS Evaluation API - Backend error:', {
          status: backendResponse.status,
          statusText: backendResponse.statusText,
          contentType: backendResponse.headers.get('content-type'),
          error: errorText.substring(0, 300) + (errorText.length > 300 ? '...' : '')
        });
        
        let errorMessage = "Failed to evaluate resume against job description";
        
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
            score: 0,
            reasons_for_the_score: [],
            suggestions: [],
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
      let backendData: BackendATSResponse;
      const responseText = await backendResponse.text();
      
      try {
        backendData = JSON.parse(responseText);
        console.log('ATS Evaluation API - Backend response:', { 
          success: backendData.success,
          score: backendData.score,
          reasonsCount: backendData.reasons_for_the_score?.length || 0,
          suggestionsCount: backendData.suggestions?.length || 0
        });
      } catch (jsonError) {
        console.error('ATS Evaluation API - JSON parsing error:', {
          jsonError: jsonError instanceof Error ? jsonError.message : 'Unknown',
          responseText: responseText.substring(0, 500) + (responseText.length > 500 ? '...' : ''),
          contentType: backendResponse.headers.get('content-type')
        });
        
        // Return a user-friendly error when backend returns non-JSON
        return NextResponse.json(
          { 
            success: false, 
            message: "The ATS evaluation service returned an invalid response. Please try again or contact support if the issue persists.",
            score: 0,
            reasons_for_the_score: [],
            suggestions: [],
            debug: process.env.NODE_ENV === 'development' ? {
              responseText: responseText.substring(0, 200),
              contentType: backendResponse.headers.get('content-type')
            } : undefined
          },
          { status: 502 }
        );
      }

      // Validate backend response
      if (typeof backendData.score !== 'number' || !Array.isArray(backendData.reasons_for_the_score) || !Array.isArray(backendData.suggestions)) {
        console.error('ATS Evaluation API - Invalid backend response:', backendData);
        return NextResponse.json(
          { 
            success: false, 
            message: "Invalid response from ATS evaluation service",
            score: 0,
            reasons_for_the_score: [],
            suggestions: []
          },
          { status: 500 }
        );
      }

      // Sanitize the response arrays for React rendering
      const sanitizedReasons = backendData.reasons_for_the_score.map(reason => sanitizeTextForReact(reason));
      const sanitizedSuggestions = backendData.suggestions.map(suggestion => sanitizeTextForReact(suggestion));

      // TODO: Store ATS evaluation in database for history/analytics
      // Uncomment when ATSEvaluation model is added to Prisma schema
      // try {
      //   const user = await prisma.user.findUnique({
      //     where: { email: session.user.email }
      //   });

      //   if (user) {
      //     await prisma.aTSEvaluation.create({
      //       data: {
      //         userId: user.id,
      //         resumeId: resumeId || undefined,
      //         companyName: requestData.company_name || undefined,
      //         jobDescriptionText: requestData.jd_text || undefined,
      //         jobDescriptionLink: requestData.jd_link || undefined,
      //         score: backendData.score,
      //         reasons: sanitizedReasons,
      //         suggestions: sanitizedSuggestions,
      //       }
      //     });
      //   }
      // } catch (dbError) {
      //   console.error('ATS Evaluation API - Database error (non-critical):', dbError);
      //   // Continue processing even if DB save fails
      // }

      const response: ATSEvaluationResponse = {
        success: true,
        message: backendData.message || "ATS evaluation completed successfully",
        score: backendData.score,
        reasons_for_the_score: sanitizedReasons,
        suggestions: sanitizedSuggestions
      };

      console.log('ATS Evaluation API - Sending response:', { 
        success: response.success,
        score: response.score,
        reasonsCount: response.reasons_for_the_score.length,
        suggestionsCount: response.suggestions.length
      });

      return NextResponse.json(response);

    } catch (fetchError) {
      console.error('ATS Evaluation API - Fetch error:', fetchError);
      
      let errorMessage = "Failed to connect to ATS evaluation service";
      
      if (fetchError instanceof Error) {
        if (fetchError.name === 'AbortError') {
          errorMessage = "Request timed out. The ATS evaluation service took too long to respond.";
        } else if (fetchError.message.includes('ECONNREFUSED') || fetchError.message.includes('ENOTFOUND')) {
          errorMessage = "Cannot connect to ATS evaluation service. Please try again later.";
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
          score: 0,
          reasons_for_the_score: [],
          suggestions: []
        },
        { status: 503 }
      );
    }

  } catch (error) {
    console.error('ATS Evaluation API - Unexpected error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: `An unexpected error occurred: ${error instanceof Error ? error.message : 'Unknown error'}`,
        score: 0,
        reasons_for_the_score: [],
        suggestions: []
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
