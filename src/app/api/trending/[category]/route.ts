import { NextResponse } from 'next/server';
import { endpoints } from '@/lib/api';

export async function GET(
    request: Request,
    { params }: { params: { category: string } }
) {
    try {
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

        // Fetch trending products from the server
        const { category } = await params;
        const response = await fetch(`${endpoints.trending}/${category}`, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            return NextResponse.json(
                { error: 'Failed to fetch trending products' },
                { status: response.status }
            );
        }

        const data = await response.json();

        // Format the response based on the data structure
        if (Array.isArray(data)) {
            return NextResponse.json(data);
        } else if (typeof data === 'object' && data !== null) {
            // Handle tag-wise products (e.g., { watches: [...] })
            return NextResponse.json(data);
        } else {
            return NextResponse.json(
                { error: 'Invalid data format received from server' },
                { status: 500 }
            );
        }
    } catch (error: unknown) {
        return NextResponse.json(
            { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
} 