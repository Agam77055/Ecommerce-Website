import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const productId = searchParams.get('productId');
  if (!productId) {
    return NextResponse.json({ error: 'No productId provided' }, { status: 400 });
  }

  try {
    // Proxy the request to the Express backend
    const apiRes = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001'}/api/bought-together?productId=${productId}`);
    const data = await apiRes.json();
    return NextResponse.json(data, { status: apiRes.status });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch bought together products' }, { status: 500 });
  }
} 