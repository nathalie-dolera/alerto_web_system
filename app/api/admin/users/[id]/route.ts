import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'alerto-admin-secret-key-for-jwt';

async function getAuthorizedUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('adminAuthToken')?.value;
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { email: string,
      role: string };
    return decoded;
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
}

//toggle user status
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const adminUser = await getAuthorizedUser();
    if (!adminUser) {
      return NextResponse.json({
        error: 'Unauthorized' 
      }, {
        status: 401 
      });
    }

    const { id } = await params;

    if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) {
      return NextResponse.json({
        error: 'Invalid user ID format' 
      }, {
        status: 400 
      });
    }
    const { status } = await request.json();

    if (!status) {
      return NextResponse.json({
        error: 'Status is required' 
      }, {
        status: 400 
      });
    }

    const admin = await prisma.admin.findUnique({
      where: {
        id 
      } 
    });
    if (admin) {
      if (admin.role === 'super-admin' && adminUser.role !== 'super-admin') {
        return NextResponse.json({
          error: 'Insufficient permissions' 
        }, {
          status: 403 
        });
      }

      await prisma.admin.update({
        where: {
          id 
        },
        data: {
          status 
        }
      });
      return NextResponse.json({
        success: true,
        message: 'Admin status updated' 
      });
    }

    const user = await prisma.user.findUnique({
      where: {
        id 
      } 
    });
    if (user) {
      await prisma.user.update({
        where: {
          id 
        },
        data: {
          status 
        }
      });
      return NextResponse.json({
        success: true,
        message: 'User status updated' 
      });
    }

    return NextResponse.json({
      error: 'User not found' 
    }, {
      status: 404 
    });
  } catch (error) {
    console.error('Update status error:', error);
    return NextResponse.json({
      error: 'Internal server error' 
    }, {
      status: 500 
    });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const adminUser = await getAuthorizedUser();
    if (!adminUser) {
      return NextResponse.json({
        error: 'Unauthorized' 
      }, {
        status: 401 
      });
    }

    if (adminUser.role !== 'super-admin') {
      return NextResponse.json({
        error: 'Unauthorized. Only super-admins can delete users.' 
      }, {
        status: 403 
      });
    }

    const { id } = await params;

    if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) {
      return NextResponse.json({
        error: 'Invalid user ID format' 
      }, {
        status: 400 
      });
    }

    const admin = await prisma.admin.findUnique({
      where: {
        id 
      } 
    });
    if (admin) {
      if (admin.email === adminUser.email) {
        return NextResponse.json({
          error: 'You cannot delete yourself' 
        }, {
          status: 400 
        });
      }

      await prisma.admin.delete({
        where: {
          id 
        } 
      });
      return NextResponse.json({
        success: true,
        message: 'Admin deleted' 
      });
    }

    const user = await prisma.user.findUnique({
      where: {
        id 
      } 
    });
    if (user) {
      await prisma.user.delete({
        where: {
          id 
        } 
      });
      return NextResponse.json({
        success: true,
        message: 'User deleted' 
      });
    }

    return NextResponse.json({
      error: 'User not found' 
    }, {
      status: 404 
    });
  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json({
      error: 'Internal server error' 
    }, {
      status: 500 
    });
  }
}
