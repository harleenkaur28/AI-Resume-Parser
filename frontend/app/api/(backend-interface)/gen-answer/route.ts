import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';

/**
 * Hiring Assistant Bridge API
 * 
 * This API acts as a bridge between the frontend and the backend hiring assistant service.
 * It supports two scenarios:
 * 
 * 1. Using existing resume from database (POST with resumeId):
 *    - Calls backend API v2: /api/v2/hiring-assistant/
 *    - Requires: resumeId, role, questions, company_name
 *    - Optional: user_knowledge, company_url, word_limit
 * 
 * 2. Using uploaded file (POST with file):
 *    - Calls backend API v1: /api/v1/hiring-assistant/
 *    - Requires: file, role, questions, company_name
 *    - Optional: user_knowledge, company_url, word_limit
 * 
 * GET endpoint returns user's available resumes for selection.
 */

// Helper function to parse questions string/array
function parseQuestions(questions: string): string[] {
  try {
    // If it's already a JSON string, parse it
    if (questions.startsWith('[') || questions.startsWith('{')) {
      const parsed = JSON.parse(questions);
      if (Array.isArray(parsed)) {
        return parsed.filter(q => typeof q === 'string' && q.trim().length > 0);
      }
      // If it's an object, extract values
      if (typeof parsed === 'object' && parsed !== null) {
        return Object.values(parsed).filter((q): q is string => typeof q === 'string' && q.trim().length > 0);
      }
      return [questions];
    }
    // If it's a comma-separated string, split it
    if (questions.includes(',')) {
      return questions.split(',').map(q => q.trim()).filter(q => q.length > 0);
    }
    // Single question
    return [questions.trim()].filter(q => q.length > 0);
  } catch (error) {
    console.error('Error parsing questions:', error);
    // Fallback: treat as single question
    return [questions.trim()].filter(q => q.length > 0);
  }
}

// Helper function to format questions for backend API
function formatQuestionsForBackend(questions: string[]): string {
  // Backend expects questions as a JSON string array
  return JSON.stringify(questions);
}

// Helper function to sanitize response data for React rendering
function sanitizeResponseData(data: any): any {
  if (typeof data !== 'object' || data === null) {
    return data;
  }
  
  // If the data is a string that looks like interview answers, parse it
  if (typeof data === 'string') {
    return parseInterviewAnswers(data);
  }
  
  // If data is already in the correct format (question -> answer mapping), return as is
  if (typeof data === 'object' && !Array.isArray(data)) {
    // Check if all values are strings (which would indicate question -> answer mapping)
    const allValuesAreStrings = Object.values(data).every(value => typeof value === 'string');
    if (allValuesAreStrings) {
      return data; // Return the question -> answer mapping as is
    }
  }
  
  const sanitized: any = {};
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string' && value.length > 500) {
      // Long strings that might be interview answers
      sanitized[key] = parseInterviewAnswers(value);
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      // Convert objects to arrays or strings for React rendering
      if (Object.keys(value).length === 1) {
        // If object has only one key, use the value
        sanitized[key] = Object.values(value)[0];
      } else {
        // Convert object to array of entries
        sanitized[key] = Object.entries(value).map(([k, v]) => `${k}: ${v}`);
      }
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

// Helper function to parse interview answers from text
function parseInterviewAnswers(text: string): { [key: string]: string } {
  const answers: { [key: string]: string } = {};
  
  // Try to split by common patterns like "Q1:", "Question 1:", "1.", etc.
  const patterns = [
    /\*\*\s*(.+?)\?\s*\*\*/g, // **Question?**
    /\d+\.\s*(.+?)\?/g, // 1. Question?
    /Q\d+[:\.]?\s*(.+?)\?/g, // Q1: Question?
    /Question\s*\d+[:\.]?\s*(.+?)\?/g // Question 1: Question?
  ];
  
  let questionAnswerPairs: Array<{question: string, answer: string}> = [];
  
  // Try to extract question-answer pairs
  for (const pattern of patterns) {
    const matches = Array.from(text.matchAll(pattern));
    if (matches.length > 0) {
      // Split text by questions to get answers
      const parts = text.split(pattern);
      for (let i = 0; i < matches.length; i++) {
        const question = matches[i][1].trim();
        const nextMatch = matches[i + 1];
        const answerStart = matches[i].index! + matches[i][0].length;
        const answerEnd = nextMatch ? nextMatch.index! : text.length;
        const answer = text.substring(answerStart, answerEnd).trim();
        
        if (question && answer) {
          questionAnswerPairs.push({ question: question + '?', answer });
        }
      }
      break; // Use the first pattern that works
    }
  }
  
  // If no patterns worked, try to split by common answer indicators
  if (questionAnswerPairs.length === 0) {
    const lines = text.split('\n').filter(line => line.trim());
    let currentQuestion = '';
    let currentAnswer = '';
    
    for (const line of lines) {
      if (line.includes('?') && !currentAnswer) {
        // This looks like a question
        if (currentQuestion && currentAnswer) {
          answers[currentQuestion] = currentAnswer.trim();
        }
        currentQuestion = line.trim();
        currentAnswer = '';
      } else if (currentQuestion) {
        // This is part of the answer
        currentAnswer += (currentAnswer ? '\n' : '') + line.trim();
      }
    }
    
    // Add the last question-answer pair
    if (currentQuestion && currentAnswer) {
      answers[currentQuestion] = currentAnswer.trim();
    }
  } else {
    // Use the parsed question-answer pairs
    questionAnswerPairs.forEach((pair, index) => {
      answers[`Question ${index + 1}: ${pair.question}`] = pair.answer;
    });
  }
  
  // If still no structured data, return the original text as a single answer
  if (Object.keys(answers).length === 0) {
    answers['Interview Response'] = text;
  }
  
  return answers;
}

// Helper function to validate file type
function isValidFileType(file: File): boolean {
  const validTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'text/markdown'
  ];
  return validTypes.includes(file.type) || 
         file.name.toLowerCase().endsWith('.pdf') ||
         file.name.toLowerCase().endsWith('.doc') ||
         file.name.toLowerCase().endsWith('.docx') ||
         file.name.toLowerCase().endsWith('.txt') ||
         file.name.toLowerCase().endsWith('.md');
}

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    
    // Extract form fields
    const resumeId = formData.get('resumeId') as string;
    const role = formData.get('role') as string;
    const questions = formData.get('questions') as string;
    const companyName = formData.get('company_name') as string;
    const userKnowledge = formData.get('user_knowledge') as string;
    const companyUrl = formData.get('company_url') as string;
    const wordLimit = formData.get('word_limit') as string;
    const file = formData.get('file') as File;

    // Validate required fields
    if (!role || !questions || !companyName) {
      return NextResponse.json({ 
        error: 'Missing required fields: role, questions, and company_name are required' 
      }, { status: 400 });
    }

    // Check if user selected existing resume or uploaded new file
    if (resumeId && !file) {
      // Scenario 1: Using existing resume from database
      console.log('Using existing resume with ID:', resumeId);
      
      // Fetch resume from database
      const resume = await prisma.resume.findUnique({
        where: { id: resumeId },
        include: { user: true }
      });

      if (!resume) {
        return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
      }

      // Check if user owns the resume or has admin/recruiter access
      const user = await prisma.user.findUnique({
        where: { id: (session.user as any).id },
        include: { role: true }
      });

      const canAccess = resume.userId === (session.user as any).id || 
                       user?.role?.name === 'Admin' || 
                       user?.role?.name === 'Recruiter';

      if (!canAccess) {
        return NextResponse.json({ error: 'Access denied to this resume' }, { status: 403 });
      }

      // Prepare data for backend API v2
      const questionsArray = parseQuestions(questions);
      const backendFormData = new FormData();
      backendFormData.append('resume_text', resume.rawText);
      backendFormData.append('role', role);
      backendFormData.append('questions', formatQuestionsForBackend(questionsArray));
      backendFormData.append('company_name', companyName);
      
      if (userKnowledge) backendFormData.append('user_knowledge', userKnowledge);
      if (companyUrl) backendFormData.append('company_url', companyUrl);
      if (wordLimit) backendFormData.append('word_limit', wordLimit);

      // Call backend API v2
      const backendResponse = await fetch(`${BACKEND_URL}/api/v2/hiring-assistant/`, {
        method: 'POST',
        body: backendFormData,
        signal: AbortSignal.timeout(30000), // 30 second timeout
      });

      if (!backendResponse.ok) {
        const errorText = await backendResponse.text();
        console.error('Backend API v2 error:', {
          status: backendResponse.status,
          statusText: backendResponse.statusText,
          contentType: backendResponse.headers.get('content-type'),
          error: errorText.substring(0, 300) + (errorText.length > 300 ? '...' : '')
        });
        
        let errorMessage = "Backend processing failed";
        
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
            errorMessage = `Server error: ${errorText.trim()}`;
          }
        }
        
        return NextResponse.json({ 
          error: errorMessage, 
          details: process.env.NODE_ENV === 'development' ? {
            status: backendResponse.status,
            statusText: backendResponse.statusText,
            contentType: backendResponse.headers.get('content-type'),
            responsePreview: errorText.substring(0, 200)
          } : undefined
        }, { status: backendResponse.status });
      }

      // Try to parse JSON response, handle non-JSON responses gracefully
      let backendResult: any;
      const responseText = await backendResponse.text();
      
      try {
        backendResult = JSON.parse(responseText);
      } catch (jsonError) {
        console.error('Backend API v2 JSON parsing error:', {
          jsonError: jsonError instanceof Error ? jsonError.message : 'Unknown',
          responseText: responseText.substring(0, 500) + (responseText.length > 500 ? '...' : ''),
          contentType: backendResponse.headers.get('content-type')
        });
        
        return NextResponse.json({
          error: "The interview service returned an invalid response. Please try again or contact support if the issue persists.",
          details: process.env.NODE_ENV === 'development' ? {
            responseText: responseText.substring(0, 200),
            contentType: backendResponse.headers.get('content-type')
          } : undefined
        }, { status: 502 });
      }

      // Process and sanitize the response data to extract answers
      const sanitizedData = backendResult.data || sanitizeResponseData(backendResult);
      
      // Store the hiring assistant request in database
      const interviewRequest = await prisma.interviewRequest.create({
        data: {
          userId: (session.user as any).id,
          role,
          questions: questionsArray, // Use parsed questions array
          companyName,
          userKnowledge: userKnowledge || null,
          companyUrl: companyUrl || null,
          wordLimit: wordLimit ? parseInt(wordLimit) : 150, // Default word limit
        }
      });

      // Extract and save individual answers
      if (sanitizedData && typeof sanitizedData === 'object') {
        const answerPromises = [];
        console.log('Processing sanitized data for answer saving (existing resume):', Object.keys(sanitizedData));
        
        // Process each entry in sanitizedData - keys are questions, values are answers
        for (const [question, answer] of Object.entries(sanitizedData)) {
          if (typeof answer === 'string' && answer.trim()) {
            console.log(`Saving answer for question: "${question}"`);
            
            // Save the answer to database
            answerPromises.push(
              prisma.interviewAnswer.create({
                data: {
                  requestId: interviewRequest.id,
                  question: question.trim(),
                  answer: answer.trim()
                }
              }).catch((error) => {
                console.error(`Failed to save answer for question "${question}":`, error);
                throw error;
              })
            );
          } else if (typeof answer === 'object' && answer !== null) {
            // Handle nested question-answer objects (fallback case)
            for (const [subQuestion, subAnswer] of Object.entries(answer)) {
              if (typeof subAnswer === 'string' && subAnswer.trim()) {
                console.log(`Saving nested answer for question: "${subQuestion}"`);
                answerPromises.push(
                  prisma.interviewAnswer.create({
                    data: {
                      requestId: interviewRequest.id,
                      question: subQuestion.trim(),
                      answer: subAnswer.trim()
                    }
                  }).catch((error) => {
                    console.error(`Failed to save nested answer for question "${subQuestion}":`, error);
                    throw error;
                  })
                );
              }
            }
          }
        }
        
        // Wait for all answers to be saved
        if (answerPromises.length > 0) {
          console.log(`Attempting to save ${answerPromises.length} answers to database`);
          try {
            await Promise.all(answerPromises);
            console.log('Successfully saved all answers to database');
          } catch (error) {
            console.error('Error saving answers to database:', error);
            throw error;
          }
        } else {
          console.warn('No valid question-answer pairs found to save');
        }
      }

      return NextResponse.json({
        success: true,
        message: 'Interview assistance generated successfully using existing resume',
        data: sanitizedData,
        source: 'existing_resume',
        resumeId: resumeId
      });

    } else if (file && !resumeId) {
      // Scenario 2: Using uploaded file
      console.log('Using uploaded file:', file.name);
      
      if (!isValidFileType(file)) {
        return NextResponse.json({ 
          error: 'Invalid file type. Please upload a PDF, DOC, DOCX, TXT, or MD file' 
        }, { status: 400 });
      }

      // Prepare data for backend API v1
      const questionsArrayForFile = parseQuestions(questions);
      const backendFormData = new FormData();
      backendFormData.append('file', file);
      backendFormData.append('role', role);
      backendFormData.append('questions', formatQuestionsForBackend(questionsArrayForFile));
      backendFormData.append('company_name', companyName);
      
      if (userKnowledge) backendFormData.append('user_knowledge', userKnowledge);
      if (companyUrl) backendFormData.append('company_url', companyUrl);
      if (wordLimit) backendFormData.append('word_limit', wordLimit);

      // Call backend API v1
      const backendResponse = await fetch(`${BACKEND_URL}/api/v1/hiring-assistant/`, {
        method: 'POST',
        body: backendFormData,
        signal: AbortSignal.timeout(30000), // 30 second timeout
      });

      if (!backendResponse.ok) {
        const errorText = await backendResponse.text();
        console.error('Backend API v1 error:', {
          status: backendResponse.status,
          statusText: backendResponse.statusText,
          contentType: backendResponse.headers.get('content-type'),
          error: errorText.substring(0, 300) + (errorText.length > 300 ? '...' : '')
        });
        
        let errorMessage = "Backend processing failed";
        
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
            errorMessage = `Server error: ${errorText.trim()}`;
          }
        }
        
        return NextResponse.json({ 
          error: errorMessage, 
          details: process.env.NODE_ENV === 'development' ? {
            status: backendResponse.status,
            statusText: backendResponse.statusText,
            contentType: backendResponse.headers.get('content-type'),
            responsePreview: errorText.substring(0, 200)
          } : undefined
        }, { status: backendResponse.status });
      }

      // Try to parse JSON response, handle non-JSON responses gracefully
      let backendResult: any;
      const responseText = await backendResponse.text();
      
      try {
        backendResult = JSON.parse(responseText);
      } catch (jsonError) {
        console.error('Backend API v1 JSON parsing error:', {
          jsonError: jsonError instanceof Error ? jsonError.message : 'Unknown',
          responseText: responseText.substring(0, 500) + (responseText.length > 500 ? '...' : ''),
          contentType: backendResponse.headers.get('content-type')
        });
        
        return NextResponse.json({
          error: "The interview service returned an invalid response. Please try again or contact support if the issue persists.",
          details: process.env.NODE_ENV === 'development' ? {
            responseText: responseText.substring(0, 200),
            contentType: backendResponse.headers.get('content-type')
          } : undefined
        }, { status: 502 });
      }

      // Process and sanitize the response data to extract answers
      const sanitizedData = backendResult.data || sanitizeResponseData(backendResult);

      // Store the hiring assistant request in database
      const interviewRequest = await prisma.interviewRequest.create({
        data: {
          userId: (session.user as any).id,
          role,
          questions: questionsArrayForFile, // Use parsed questions array
          companyName,
          userKnowledge: userKnowledge || null,
          companyUrl: companyUrl || null,
          wordLimit: wordLimit ? parseInt(wordLimit) : 150, // Default word limit
        }
      });

      // Extract and save individual answers
      if (sanitizedData && typeof sanitizedData === 'object') {
        const answerPromises = [];
        console.log('Processing sanitized data for answer saving (file upload):', Object.keys(sanitizedData));
        
        // Process each entry in sanitizedData - keys are questions, values are answers
        for (const [question, answer] of Object.entries(sanitizedData)) {
          if (typeof answer === 'string' && answer.trim()) {
            console.log(`Saving answer for question: "${question}"`);
            
            // Save the answer to database
            answerPromises.push(
              prisma.interviewAnswer.create({
                data: {
                  requestId: interviewRequest.id,
                  question: question.trim(),
                  answer: answer.trim()
                }
              }).catch((error) => {
                console.error(`Failed to save answer for question "${question}":`, error);
                throw error;
              })
            );
          } else if (typeof answer === 'object' && answer !== null) {
            // Handle nested question-answer objects (fallback case)
            for (const [subQuestion, subAnswer] of Object.entries(answer)) {
              if (typeof subAnswer === 'string' && subAnswer.trim()) {
                console.log(`Saving nested answer for question: "${subQuestion}"`);
                answerPromises.push(
                  prisma.interviewAnswer.create({
                    data: {
                      requestId: interviewRequest.id,
                      question: subQuestion.trim(),
                      answer: subAnswer.trim()
                    }
                  }).catch((error) => {
                    console.error(`Failed to save nested answer for question "${subQuestion}":`, error);
                    throw error;
                  })
                );
              }
            }
          }
        }
        
        // Wait for all answers to be saved
        if (answerPromises.length > 0) {
          console.log(`Attempting to save ${answerPromises.length} answers to database`);
          try {
            await Promise.all(answerPromises);
            console.log('Successfully saved all answers to database');
          } catch (error) {
            console.error('Error saving answers to database:', error);
            throw error;
          }
        } else {
          console.warn('No valid question-answer pairs found to save');
        }
      }

      return NextResponse.json({
        success: true,
        message: 'Interview assistance generated successfully using uploaded file',
        data: sanitizedData,
        source: 'uploaded_file',
        fileName: file.name
      });

    } else {
      // Invalid request - either both or neither provided
      return NextResponse.json({ 
        error: 'Invalid request. Please either select an existing resume (resumeId) or upload a new file (file), but not both.' 
      }, { status: 400 });
    }

  } catch (error) {
    console.error('Bridge API error:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
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