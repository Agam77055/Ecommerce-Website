import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { endpoints } from '@/lib/api';
import { Session } from 'next-auth';

export async function POST(request: Request) {
    try {
        console.log('Purchase API called');
        
        // Check if user is authenticated
        const session = await getServerSession(authOptions) as Session & { user: { id: string } };
        console.log('Session:', { 
            hasUser: !!session?.user,
            userId: session?.user?.id 
        });

        if (!session?.user?.id) {
            console.log('Authentication failed - no user session');
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        const { products } = await request.json();
        console.log('Received products:', products);

        if (!Array.isArray(products) || products.length === 0) {
            console.log('Invalid products data');
            return NextResponse.json(
                { error: 'Invalid products data' },
                { status: 400 }
            );
        }

        // Format data for backend exactly as server expects
        const purchaseData = {
            user: session.user.id,
            product: products // Send as array, server will handle conversion
        };

        console.log('Sending purchase data to backend:', purchaseData);

        // Send purchase data to backend
        const response = await fetch(endpoints.purchase, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(purchaseData),
        });

        console.log('Backend response:', {
            status: response.status,
            ok: response.ok,
            statusText: response.statusText
        });

        if (!response.ok) {
            const errorData = await response.text();
            console.error('Backend error:', {
                status: response.status,
                statusText: response.statusText,
                error: errorData
            });
            throw new Error(`Failed to process purchase: ${errorData}`);
        }

        console.log('Purchase successful, returning success response');
        return NextResponse.json({ 
            message: 'Purchase successful',
            success: true 
        });
    } catch (error) {
        console.error('Purchase API error:', error);
        return NextResponse.json(
            { 
                error: error instanceof Error ? error.message : 'Failed to process purchase',
                success: false
            },
            { status: 500 }
        );
    }
} 