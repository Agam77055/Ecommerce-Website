import { NextRequest, NextResponse } from 'next/server';
import { endpoints } from '@/lib/api';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const productId = searchParams.get('productId');
  if (!productId) {
    return NextResponse.json({ error: 'No productId provided' }, { status: 400 });
  }

  try {
    // Proxy the request to the Express backend
    const url = `${endpoints.boughtTogether}?productId=${productId}`;
    console.log('Fetching bought together products from:', url);
    const apiRes = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });
    if (!apiRes.ok) {
      const errorText = await apiRes.text();
      console.error('Bought Together API error:', {
        status: apiRes.status,
        statusText: apiRes.statusText,
        error: errorText,
        url
      });
      throw new Error(`Failed to fetch bought together products: ${apiRes.statusText}`);
    }
    const data = await apiRes.json();
    return NextResponse.json(data, { status: apiRes.status });
  } catch (error) {
    console.error('Error fetching bought together products:', error);
    return NextResponse.json({ error: 'Failed to fetch bought together products' }, { status: 500 });
  }
} 