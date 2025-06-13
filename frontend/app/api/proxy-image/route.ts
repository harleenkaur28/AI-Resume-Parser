import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const imageUrl = searchParams.get('url');

    if (!imageUrl) {
      return new NextResponse('Missing image URL', { status: 400 });
    }

    // Validate that it's a Google profile image URL, GitHub avatar, or other common image hosts
    const allowedHosts = [
      'googleusercontent.com',
      'github.com', 
      'githubusercontent.com',
      'gravatar.com',
      'avatars.githubusercontent.com',
      'lh3.googleusercontent.com'
    ];
    
    const imageUrlObj = new URL(imageUrl);
    const isAllowedHost = allowedHosts.some(host => imageUrlObj.hostname.includes(host));
    
    if (!isAllowedHost) {
      return new NextResponse('Image URL not from allowed hosts', { status: 400 });
    }

    // Fetch the image from Google/GitHub with retry logic
    let response: Response | undefined;
    let retries = 3;
    
    while (retries > 0) {
      try {
        response = await fetch(imageUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; TalentSync/1.0)',
            'Accept': 'image/*',
          },
          // Add timeout
          signal: AbortSignal.timeout(10000), // 10 second timeout
        });
        
        if (response.ok) {
          break;
        } else if (response.status === 429) {
          // Rate limited, wait and retry
          await new Promise(resolve => setTimeout(resolve, 1000));
          retries--;
          continue;
        } else {
          throw new Error(`HTTP ${response.status}`);
        }
      } catch (error) {
        retries--;
        if (retries === 0) {
          throw error;
        }
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    if (!response || !response.ok) {
      throw new Error('Failed to fetch image after retries');
    }

    const imageBuffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'image/jpeg';

    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('Error proxying image:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
