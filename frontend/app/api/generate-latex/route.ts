import { NextRequest, NextResponse } from 'next/server';
import { PdfGenerationRequest } from '@/types/resume';
import { generateLatexDocument } from '@/utils/latexGenerator';

export async function POST(request: NextRequest) {
  try {
    const body: PdfGenerationRequest = await request.json();
    
    if (!body.resumeData) {
      return NextResponse.json(
        { error: 'Resume data is required' },
        { status: 400 }
      );
    }

    // Validate required fields
    const { resumeData } = body;
    if (!resumeData.name || !resumeData.email) {
      return NextResponse.json(
        { error: 'Name and email are required fields' },
        { status: 400 }
      );
    }

    const latexContent = generateLatexDocument(body);
    
    return NextResponse.json({ 
      success: true, 
      latex: latexContent,
      template: body.template || 'professional'
    });
    
  } catch (error) {
    console.error('Error generating LaTeX:', error);
    return NextResponse.json(
      { error: 'Failed to generate LaTeX document' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { 
      message: 'LaTeX generation endpoint',
      availableTemplates: ['professional', 'modern'],
      supportedOptions: {
        fontSize: 'number (8-12)',
        margins: 'object with top, bottom, left, right in inches',
        colorScheme: 'string (default, blue, green, red)'
      }
    },
    { status: 200 }
  );
}
