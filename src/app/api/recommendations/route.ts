import { NextResponse } from 'next/server';
import { endpoints } from '@/lib/api';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json(
                { error: 'User ID is required' },
                { status: 400 }
            );
        }

        console.log('Fetching recommendations from:', `${endpoints.recommendations}?userId=${userId}`);

        const response = await fetch(`${endpoints.recommendations}?userId=${userId}`, {
            method: 'GET',
            headers: {
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