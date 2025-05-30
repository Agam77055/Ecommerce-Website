import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { endpoints } from '@/lib/api';
import { Session } from 'next-auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        // Check if user is authenticated
        const session = await getServerSession(authOptions) as Session & { user: { id: string } };
        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        // Check if server is available
        try {
            const serverCheck = await fetch(endpoints.productIds, {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });
            if (!serverCheck.ok) {
                throw new Error('Server is not available');
            }
        } catch (error) {
            return NextResponse.json(
                { error: 'Server is not available' },
                { status: 503 }
            );
        }

        console.log('Fetching recommendations from:', `${endpoints.recommendations}?userId=${session.user.id}`);

        const response = await fetch(`${endpoints.recommendations}?userId=${session.user.id}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            cache: 'no-store',
        });

        if (!response.ok) {
            console.error('Recommendations API error:', response.status, response.statusText);
            throw new Error(`Failed to fetch recommendations: ${response.statusText}`);
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error in recommendations route:', error);
        return NextResponse.json(
            { error: 'Failed to fetch recommendations' },
            { status: 500 }
        );
    }
} 