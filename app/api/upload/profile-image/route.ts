import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { writeFile, mkdir, unlink } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { Buffer } from 'buffer';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.' 
      }, { status: 400 });
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: 'File too large. Maximum size is 5MB.' 
      }, { status: 400 });
    }

    // Create upload directory if it doesn't exist
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'profiles');
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Get current user's profile image to delete old file
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { image: true }
    });

    // Generate unique filename
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const fileName = `${session.user.id}-${timestamp}.${fileExtension}`;
    const filePath = join(uploadDir, fileName);

    // Save new file
    await writeFile(filePath, buffer);

    // Delete old profile image if it exists and is a local upload
    if (currentUser?.image && currentUser.image.startsWith('/uploads/profiles/')) {
      try {
        const oldFileName = currentUser.image.replace('/uploads/profiles/', '');
        const oldFilePath = join(uploadDir, oldFileName);
        if (existsSync(oldFilePath)) {
          await unlink(oldFilePath);}
      } catch (deleteError) {
        if (process.env.NODE_ENV === "development") { console.error('Error deleting old profile image:', deleteError); }
        // Don't fail the upload if old file deletion fails
      }
    }

    // Update user's image in database
    await prisma.user.update({
      where: { id: session.user.id },
      data: { image: `/uploads/profiles/${fileName}` }
    });

    // Return the public URL
    const publicUrl = `/uploads/profiles/${fileName}`;

    return NextResponse.json({ 
      success: true, 
      url: publicUrl,
      message: 'Profile picture uploaded successfully' 
    });

  } catch (error) {
    if (process.env.NODE_ENV === "development") { console.error('Upload error:', error); }
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
