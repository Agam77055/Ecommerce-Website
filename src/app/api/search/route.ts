import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

export async function POST(request: Request) {
    try {
        const { searchTerm } = await request.json();

        if (!searchTerm) {
            return NextResponse.json(
                { error: 'Search term is required' },
                { status: 400 }
            );
        }

        // First check if the server is available
        try {
            const serverCheck = await fetch(`${API_URL}/search`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ searchTerm }),
            });

            if (!serverCheck.ok) {
                return NextResponse.json(
                    { error: 'Search service is currently unavailable' },
                    { status: 503 }
                );
            }

            const data = await serverCheck.json();

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