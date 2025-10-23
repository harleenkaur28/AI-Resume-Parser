import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;

    // Get form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const customName = formData.get('customName') as string;
    const showInCentral = formData.get('showInCentral') === 'true';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!customName) {
      return NextResponse.json({ error: 'Custom name is required' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
      'application/msword',
      'text/plain',
      'text/markdown'
    ];
    if (!allowedTypes.includes(file.type) && 
        !file.name.toLowerCase().endsWith('.pdf') &&
        !file.name.toLowerCase().endsWith('.doc') &&
        !file.name.toLowerCase().endsWith('.docx') &&
        !file.name.toLowerCase().endsWith('.txt') &&
        !file.name.toLowerCase().endsWith('.md')) {
      return NextResponse.json({ error: 'Invalid file type. Only PDF, Word documents, TXT, and MD files are allowed.' }, { status: 400 });
    }

    // Create form data for backend
    const backendFormData = new FormData();
    backendFormData.append('file', file);

    // Forward to FastAPI backend
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000';
    const backendResponse = await fetch(`${backendUrl}/api/v1/resume/comprehensive/analysis/`, {
      method: 'POST',
      body: backendFormData,
    });

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json();
      return NextResponse.json({ 
        error: 'Backend analysis failed', 
        details: errorData 
      }, { status: backendResponse.status });
    }

    const analysisResult = await backendResponse.json();
    
    // Validate the response structure
    if (!analysisResult.success || !analysisResult.data) {
      return NextResponse.json({ error: 'Invalid response from backend' }, { status: 500 });
    }

    const data = analysisResult.data;
    const cleanedText = analysisResult.cleaned_text || '';

    // Store resume information and analysis results in database
    const resume = await prisma.resume.create({
      data: {
        userId: userId,
        customName: customName,
        rawText: cleanedText,
        showInCentral: showInCentral,
        analysis: {
          create: {
            name: data.name || '',
            email: data.email || '',
            contact: data.contact || '',
            linkedin: data.linkedin || '',
            github: data.github || '',
            blog: data.blog || '',
            portfolio: data.portfolio || '',
            predictedField: data.predicted_field || '',
            skillsAnalysis: data.skills_analysis || [],
            recommendedRoles: data.recommended_roles || [],
            languages: data.languages || [],
            education: data.education || [],
            workExperience: data.work_experience || [],
            projects: data.projects || [],
            publications: data.publications || [],
            positionsOfResponsibility: data.positions_of_responsibility || [],
            certifications: data.certifications || [],
            achievements: data.achievements || [],
          }
        }
      },
      include: {
        analysis: true
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Resume uploaded and analyzed successfully',
      data: {
        resumeId: resume.id,
        analysis: resume.analysis,
        cleanedText: cleanedText
      }
    });

  } catch (error) {
    console.error('Error in resume analysis:', error);
    
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}