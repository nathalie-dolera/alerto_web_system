import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, name, googleId, image } = body;

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