import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { writeFile, mkdir, unlink } from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  let filePath: string | null = null;
  
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
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Only PDF and Word documents are allowed.' }, { status: 400 });
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    try {
      await mkdir(uploadsDir, { recursive: true });
    } catch (error) {
      // Directory might already exist, continue
    }

    // Generate unique filename
    const fileExtension = path.extname(file.name);
    const uniqueFilename = `${crypto.randomUUID()}${fileExtension}`;
    filePath = path.join(uploadsDir, uniqueFilename);
    const fileUrl = `/uploads/${uniqueFilename}`;

    // Save file to disk
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, new Uint8Array(buffer));

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

    // Store file information and analysis results in database
    const resume = await prisma.resume.create({
      data: {
        userId: userId,
        customName: customName,
        fileUrl: fileUrl,
        showInCentral: showInCentral,
        analysis: {
          create: {
            name: data.name || '',
            email: data.email || '',
            contact: data.contact || '',
            predictedField: data.predicted_field || '',
            skillsAnalysis: data.skills_analysis || [],
            recommendedRoles: data.recommended_roles || [],
            languages: data.languages || [],
            education: data.education || [],
            workExperience: data.work_experience || [],
            projects: data.projects || [],
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
        cleanedText: analysisResult.cleaned_text || ''
      }
    });

  } catch (error) {
    console.error('Error in resume analysis:', error);
    
    // Clean up uploaded file if it exists and there was an error
    if (filePath) {
      try {
        await unlink(filePath);
      } catch (unlinkError) {
        console.error('Error cleaning up file:', unlinkError);
      }
    }
    
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}