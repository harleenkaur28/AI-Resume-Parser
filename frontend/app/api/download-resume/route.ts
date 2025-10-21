import { NextRequest, NextResponse } from 'next/server';
import { PdfGenerationRequest } from '@/types/resume';
import { generateLatexDocument } from '@/utils/latexGenerator';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { randomUUID } from 'crypto';

const execAsync = promisify(exec);

// PDF generation function using pdflatex
async function generatePdfFromLatex(latexContent: string): Promise<Buffer> {
  const jobId = randomUUID();
  const tempDir = os.tmpdir();
  const baseFilename = `resume_${jobId}`;
  const texFilePath = path.join(tempDir, `${baseFilename}.tex`);
  const pdfFilePath = path.join(tempDir, `${baseFilename}.pdf`);
  const logFilePath = path.join(tempDir, `${baseFilename}.log`);

  try {
    // Write LaTeX content to file
    await fs.writeFile(texFilePath, latexContent, 'utf8');

    // Compile LaTeX to PDF using pdflatex
    const command = `pdflatex -interaction=nonstopmode -output-directory="${tempDir}" "${texFilePath}"`;
    
    try {
      await execAsync(command, { 
        timeout: 30000, // 30 second timeout
        cwd: tempDir 
      });
    } catch (execError: any) {
      // Try to read log file for more detailed error information
      let logContent = '';
      try {
        logContent = await fs.readFile(logFilePath, 'utf8');
      } catch (logError) {
        // Ignore log read errors
      }

      throw new Error(`LaTeX compilation failed: ${execError.message}${logContent ? `\n\nLaTeX Log:\n${logContent}` : ''}`);
    }

    // Check if PDF was generated
    try {
      await fs.access(pdfFilePath);
    } catch (accessError) {
      throw new Error('PDF file was not generated despite successful compilation');
    }

    // Read the PDF file
    const pdfBuffer = await fs.readFile(pdfFilePath);

    // Clean up temporary files
    const filesToClean = [texFilePath, pdfFilePath, logFilePath];
    await Promise.allSettled(
      filesToClean.map(async (filePath) => {
        try {
          await fs.unlink(filePath);
        } catch (cleanupError) {
          console.warn(`Failed to clean up file ${filePath}:`, cleanupError);
        }
      })
    );

    return pdfBuffer;

  } catch (error) {
    // Clean up temporary files in case of error
    const filesToClean = [texFilePath, pdfFilePath, logFilePath];
    await Promise.allSettled(
      filesToClean.map(async (filePath) => {
        try {
          await fs.unlink(filePath);
        } catch (cleanupError) {
          // Ignore cleanup errors
        }
      })
    );

    throw error;
  }
}

// Check if LaTeX is available on the system
async function checkLatexAvailability(): Promise<boolean> {
  try {
    await execAsync('pdflatex --version', { timeout: 5000 });
    return true;
  } catch (error) {
    return false;
  }
}

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
    
    // Check if LaTeX is available on the system
    const isLatexAvailable = await checkLatexAvailability();
    
    if (!isLatexAvailable) {
      console.warn('LaTeX not available on system, providing fallback');
      return NextResponse.json({
        error: 'LaTeX not installed on server',
        fallback: true,
        latex: latexContent,
        message: 'LaTeX is not installed on the server. Please install TeX Live to enable PDF generation.',
        instructions: {
          steps: [
            '1. Copy the LaTeX content below',
            '2. Visit an online LaTeX compiler like Overleaf (overleaf.com)',
            '3. Create a new document and paste the content',
            '4. Compile to generate your PDF resume'
          ]
        }
      }, { status: 503 });
    }

    try {
      // Generate PDF from LaTeX
      const pdfBuffer = await generatePdfFromLatex(latexContent);
      
      // Create filename
      const filename = `${resumeData.name.replace(/[^a-zA-Z0-9]/g, '_')}_Resume.pdf`;
      
      // Return PDF with appropriate headers
      return new NextResponse(pdfBuffer as any, {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${filename}"`,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      });

    } catch (pdfError: any) {
      console.error('PDF generation error:', pdfError);
      
      // Fallback: return LaTeX content
      return NextResponse.json({
        error: 'PDF generation failed',
        fallback: true,
        latex: latexContent,
        details: pdfError.message,
        instructions: {
          steps: [
            '1. Copy the LaTeX content below',
            '2. Visit an online LaTeX compiler like Overleaf (overleaf.com)',
            '3. Create a new document and paste the content',
            '4. Compile to generate your PDF resume'
          ]
        }
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('Error in download-resume API:', error);
    return NextResponse.json(
      { error: 'Failed to process resume download request' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Check if LaTeX is available on the system
    const isLatexAvailable = await checkLatexAvailability();
    
    return NextResponse.json({
      message: 'PDF download endpoint - Local LaTeX compilation',
      latexStatus: isLatexAvailable ? 'available' : 'unavailable',
      pdfGeneration: isLatexAvailable ? 'enabled' : 'fallback mode only',
      fallbackMode: !isLatexAvailable ? 'LaTeX content will be provided for manual compilation' : false,
      requirements: isLatexAvailable ? 'LaTeX is installed and ready' : 'Please install TeX Live for PDF generation',
      installInstructions: {
        ubuntu: 'sudo apt-get install texlive-full',
        macos: 'brew install --cask mactex',
        windows: 'Download from https://tug.org/texlive/'
      }
    });
    
  } catch (error) {
    return NextResponse.json({
      message: 'PDF download endpoint - Local LaTeX compilation',
      latexStatus: 'error',
      pdfGeneration: 'fallback mode only',
      fallbackMode: 'LaTeX content will be provided for manual compilation',
      error: 'Cannot check LaTeX availability'
    });
  }
}
