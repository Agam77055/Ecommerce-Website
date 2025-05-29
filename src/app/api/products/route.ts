import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const ids = searchParams.get('ids');

        if (!ids) {
            return NextResponse.json(
                { error: 'Product ID is required' },
                { status: 400 }
            );
        }

        // Fetch all products first
        const response = await fetch(`${API_URL}/api/product-ids`);
        if (!response.ok) {
            throw new Error('Failed to fetch product IDs');
        }

        // Then fetch the specific product
        const productResponse = await fetch(`${API_URL}/api/products?ids=${ids}`);
        if (!productResponse.ok) {
            throw new Error('Failed to fetch product');
        }

        const data = await productResponse.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error fetching products:', error);
        return NextResponse.json(
            { error: 'Failed to fetch products' },
            { status: 500 }
        );
    }
} 