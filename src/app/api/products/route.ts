import { NextResponse } from 'next/server';
import { endpoints } from '@/lib/api';

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

        console.log('Fetching products from:', `${endpoints.products}?ids=${ids}`);

        // Fetch the specific products
        const productResponse = await fetch(`${endpoints.products}?ids=${ids}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            cache: 'no-store',
        });

        if (!productResponse.ok) {
            const errorText = await productResponse.text();
            console.error('Products API error:', {
                status: productResponse.status,
                statusText: productResponse.statusText,
                error: errorText,
                url: `${endpoints.products}?ids=${ids}`
            });
            throw new Error(`Failed to fetch products: ${productResponse.statusText}`);
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