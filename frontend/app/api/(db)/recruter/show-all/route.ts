import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // TODO: Re-enable authentication later
    // Check authentication
    // const session = await getServerSession(authOptions);
    
    // if (!session?.user) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    // Check if user is a recruiter/admin
    // const user = await prisma.user.findUnique({
    //   where: { id: (session.user as any).id },
    //   include: { role: true }
    // });

    // if (!user || (user.role?.name !== 'Admin' && user.role?.name !== 'Recruiter')) {
    //   return NextResponse.json({ error: 'Access denied. Recruiter access required.' }, { status: 403 });
    // }

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const showCentralOnly = searchParams.get('centralOnly') === 'true';

    // Build where clause for filtering
    const whereClause: any = {};
    
    if (showCentralOnly) {
      whereClause.showInCentral = true;
    }

    if (search) {
      whereClause.OR = [
        {
          customName: {
            contains: search,
            mode: 'insensitive'
          }
        },
        {
          analysis: {
            name: {
              contains: search,
              mode: 'insensitive'
            }
          }
        },
        {
          analysis: {
            email: {
              contains: search,
              mode: 'insensitive'
            }
          }
        },
        {
          analysis: {
            predictedField: {
              contains: search,
              mode: 'insensitive'
            }
          }
        },
        {
          rawText: {
            contains: search,
            mode: 'insensitive'
          }
        }
      ];
    }

    // Fetch resumes with analysis data
    console.log('Fetching resumes with whereClause:', JSON.stringify(whereClause, null, 2));
    
    const resumes = await prisma.resume.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: {
              select: {
                name: true
              }
            }
          }
        },
        analysis: true
      },
      orderBy: {
        uploadDate: 'desc'
      }
    });

    console.log(`Found ${resumes.length} resumes`);

    // Transform the data for frontend consumption
    const transformedResumes = resumes.map(resume => ({
      id: resume.id,
      customName: resume.customName,
      uploadDate: resume.uploadDate,
      showInCentral: resume.showInCentral,
      rawText: resume.rawText,
      user: {
        id: resume.user.id,
        name: resume.user.name,
        email: resume.user.email,
        role: resume.user.role?.name
      },
      analysis: resume.analysis ? {
        id: resume.analysis.id,
        name: resume.analysis.name,
        email: resume.analysis.email,
        contact: resume.analysis.contact,
        predictedField: resume.analysis.predictedField,
        skillsAnalysis: resume.analysis.skillsAnalysis,
        recommendedRoles: resume.analysis.recommendedRoles,
        languages: resume.analysis.languages,
        education: resume.analysis.education,
        workExperience: resume.analysis.workExperience,
        projects: resume.analysis.projects,
        uploadedAt: resume.analysis.uploadedAt
      } : null
    }));

    return NextResponse.json({
      success: true,
      message: 'Resumes retrieved successfully',
      data: {
        resumes: transformedResumes,
        total: transformedResumes.length
      }
    });

  } catch (error) {
    console.error('Error fetching resumes:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}