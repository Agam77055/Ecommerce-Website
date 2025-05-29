import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

export async function POST(request: Request) {
    try {
        // Check if user is authenticated
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        const { products } = await request.json();

        if (!Array.isArray(products) || products.length === 0) {
            return NextResponse.json(
                { error: 'Invalid products data' },
                { status: 400 }
            );
        }

        console.log('Sending purchase data:', {
            user: session.user.id,
            product: products
        });

        // Send purchase data to backend
        const response = await fetch(`${API_URL}/api/purchase`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user: session.user.id,
                product: products
            }),
        });

        if (!response.ok) {
            const errorData = await response.text();
            console.error('Server response:', {
                status: response.status,
                statusText: response.statusText,
                error: errorData
            });
            throw new Error(`Failed to process purchase: ${errorData}`);
        }

        return NextResponse.json({ message: 'Purchase successful' });
    } catch (error) {
        console.error('Purchase error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to process purchase' },
            { status: 500 }
        );
    }
} 