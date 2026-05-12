import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { z } from 'zod';

// Simple google auth validation schema
const googleAuthValidationSchema = z.object({
    email: z.string().email("Invalid email format"),
    name: z.string().min(1, "Name is required").optional(),
    googleId: z.string().min(1, "Google ID is required"),
    image: z.string().optional(),
});

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Validate input
        const validation = googleAuthValidationSchema.safeParse(body);
        if (!validation.success) {
            const errors = validation.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join('; ');
            return NextResponse.json({ error: errors }, { status: 400 });
        }

        const { email, name, googleId, image } = validation.data;

        const user = await prisma.user.upsert({
            where: { email: email },
            update: {
                name: name,
                image: image,
                googleId: googleId
            },
            create: {
                email: email,
                name: name,
                image: image,
                googleId: googleId,
            }
        });
        
        if (user.status === 'Inactive') {
            return NextResponse.json({
                success: false,
                error: 'Your account has been disabled. Please contact support.'
            }, { status: 403 });
        }
 
        return NextResponse.json ({
            success: true, 
            message: "User authenticated successfully",
            user
        }, { status: 200});

    } catch (error) {
        console.error("API Error:", error);
        return NextResponse.json({
            success: false,
            error: 'Database connection failed'
    }, { status: 500 });
    } 
}