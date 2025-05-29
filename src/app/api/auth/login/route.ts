import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function POST(request: Request) {
    try {
        const { name, userId } = await request.json();

        if (!name || !userId) {
            return NextResponse.json(
                { error: 'Name and userId are required' },
                { status: 400 }
            );
        }

        const client = await clientPromise;
        const db = client.db('ecommerce_db');

        const user = await db.collection('users').findOne({
            user_id: parseInt(userId),
            name: name
        });

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(user);
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
} 