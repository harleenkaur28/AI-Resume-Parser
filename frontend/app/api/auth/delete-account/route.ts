import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';

export async function DELETE(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    
    console.log(`Starting account deletion process for user: ${userId}`);

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        _count: {
          select: {
            resumes: true,
            coldMailRequests: true,
            interviewRequests: true,
            accounts: true,
            sessions: true
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    console.log(`User found with ${user._count.resumes} resumes, ${user._count.coldMailRequests} cold mail requests, ${user._count.interviewRequests} interview requests`);

    // Start a transaction to ensure data consistency
    await prisma.$transaction(async (tx) => {
      // Delete in order to respect foreign key constraints
      
      // 1. Delete interview answers
      const deletedAnswers = await tx.interviewAnswer.deleteMany({
        where: {
          request: {
            userId: userId
          }
        }
      });
      console.log(`Deleted ${deletedAnswers.count} interview answers`);

      // 2. Delete interview requests
      const deletedInterviews = await tx.interviewRequest.deleteMany({
        where: { userId: userId }
      });
      console.log(`Deleted ${deletedInterviews.count} interview requests`);

      // 3. Delete cold mail responses
      const deletedColdMailResponses = await tx.coldMailResponse.deleteMany({
        where: {
          request: {
            userId: userId
          }
        }
      });
      console.log(`Deleted ${deletedColdMailResponses.count} cold mail responses`);

      // 4. Delete cold mail requests
      const deletedColdMails = await tx.coldMailRequest.deleteMany({
        where: { userId: userId }
      });
      console.log(`Deleted ${deletedColdMails.count} cold mail requests`);

      // 5. Delete analyses
      const deletedAnalyses = await tx.analysis.deleteMany({
        where: {
          resume: {
            userId: userId
          }
        }
      });
      console.log(`Deleted ${deletedAnalyses.count} analyses`);

      // 6. Delete resumes
      const deletedResumes = await tx.resume.deleteMany({
        where: { userId: userId }
      });
      console.log(`Deleted ${deletedResumes.count} resumes`);

      // 7. Delete bulk uploads
      const deletedBulkUploads = await tx.bulkUpload.deleteMany({
        where: { adminId: userId }
      });
      console.log(`Deleted ${deletedBulkUploads.count} bulk uploads`);

      // 8. Delete recruiter profile
      const deletedRecruiter = await tx.recruiter.deleteMany({
        where: { adminId: userId }
      });
      console.log(`Deleted ${deletedRecruiter.count} recruiter profiles`);

      // 9. Delete email verification tokens
      const deletedEmailTokens = await tx.emailVerificationToken.deleteMany({
        where: { userId: userId }
      });
      console.log(`Deleted ${deletedEmailTokens.count} email verification tokens`);

      // 10. Delete password reset tokens
      const deletedPasswordTokens = await tx.passwordResetToken.deleteMany({
        where: { userId: userId }
      });
      console.log(`Deleted ${deletedPasswordTokens.count} password reset tokens`);

      // 11. Delete sessions
      const deletedSessions = await tx.session.deleteMany({
        where: { userId: userId }
      });
      console.log(`Deleted ${deletedSessions.count} sessions`);

      // 12. Delete accounts (OAuth accounts)
      const deletedAccounts = await tx.account.deleteMany({
        where: { userId: userId }
      });
      console.log(`Deleted ${deletedAccounts.count} OAuth accounts`);

      // 13. Finally, delete the user
      await tx.user.delete({
        where: { id: userId }
      });
      console.log(`Deleted user account: ${userId}`);
    });

    console.log(`Account deletion completed successfully for user: ${userId}`);

    return NextResponse.json({ 
      success: true, 
      message: 'Account and all associated data have been permanently deleted' 
    });

  } catch (error) {
    console.error('Error deleting account:', error);
    return NextResponse.json({ 
      error: 'Failed to delete account', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
