import { NextResponse } from 'next/server';
import { endpoints } from '@/lib/api';

export async function POST(request: Request) {
    try {
        const { searchTerm } = await request.json();

        if (!searchTerm) {
            return NextResponse.json(
                { error: 'Search term is required' },
                { status: 400 }
            );
        }

        console.log('Attempting to connect to search endpoint:', endpoints.search);

        // First check if the server is available
        try {
            const serverCheck = await fetch(endpoints.search, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ searchTerm }),
            });

            console.log('Search API response status:', serverCheck.status);

            if (!serverCheck.ok) {
                const errorText = await serverCheck.text();
                console.error('Search API error response:', {
                    status: serverCheck.status,
                    statusText: serverCheck.statusText,
                    error: errorText,
                    url: endpoints.search
                });
                return NextResponse.json(
                    { error: 'Search service is currently unavailable' },
                    { status: 503 }
                );
            }

            const data = await serverCheck.json();
            console.log('Search API response data:', data);

            // Ensure we return an array
            if (!Array.isArray(data)) {
                console.error('Server returned non-array data:', data);
                return NextResponse.json([], { status: 200 });
            }

            // Validate and format the results
            const formattedResults = data.map(item => ({
                key: Number(item.key) || 0,
                name: String(item.name || ''),
                price: Number(item.price) || 0,
                image: String(item.image || ''),
                category: String(item.category || ''),
                description: String(item.description || ''),
                brand: String(item.brand || ''),
                rating: Number(item.rating) || 0,
                stock: Number(item.stock) || 0,
                discountPercentage: Number(item.discountPercentage) || 0
            }));

            return NextResponse.json(formattedResults);
        } catch (error) {
            console.error('Server connection error:', error);
            return NextResponse.json(
                { error: 'Search service is currently unavailable' },
                { status: 503 }
            );
        }
    } catch (error) {
        console.error('Search API error:', error);
        return NextResponse.json(
            { error: 'An error occurred while processing your search' },
            { status: 500 }
        );
    }
} 