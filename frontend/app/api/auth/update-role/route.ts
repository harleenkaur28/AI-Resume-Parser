import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth-options";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { roleId } = await req.json();

    if (!roleId) {
      return NextResponse.json(
        { error: "Role ID is required" },
        { status: 400 }
      );
    }

    // Find the role by name (since we're passing 'user' or 'admin')
    const role = await prisma.role.findUnique({
      where: { name: roleId === 'user' ? 'User' : 'Admin' }
    });

    if (!role) {
      return NextResponse.json(
        { error: "Invalid role" },
        { status: 400 }
      );
    }

    // Update the user's role
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: { roleId: role.id },
      include: { role: true }
    });

    return NextResponse.json({
      message: "Role updated successfully",
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role?.name
      }
    });

  } catch (error) {
    console.error("Error updating role:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
