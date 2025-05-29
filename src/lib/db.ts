import clientPromise from './mongodb';
import { Product } from '@/types/product';
import { Collection, Filter } from 'mongodb';

export async function getProducts(): Promise<Product[]> {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection<Product>('products');
    return collection.find({}).toArray();
}

export async function getProductByKey(key: string): Promise<Product | null> {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection<Product>('products');
    const filter: Filter<Product> = { key };
    return collection.findOne(filter);
}

export async function getProductsByCategory(category: string): Promise<Product[]> {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection<Product>('products');
    return collection.find({ category }).toArray();
}

export async function searchProducts(query: string): Promise<Product[]> {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection<Product>('products');
    return collection.find({
        $or: [
            { name: { $regex: query, $options: 'i' } },
            { description: { $regex: query, $options: 'i' } }
        ]
    }).toArray();
}

interface UserPurchase {
    userId: string;
    productId: string;
    purchaseDate: string;
    quantity: number;
}

interface User {
    id: string;
    name: string;
    email: string;
    preferences: string[];
}

export async function getUserPurchases(userId: string): Promise<UserPurchase[]> {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection<UserPurchase>('user_purchases');
    return collection.find({ userId }).toArray();
}

export async function getUserPreferences(userId: string): Promise<string[]> {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection<User>('users');
    const user = await collection.findOne({ id: userId });
    return user?.preferences || [];
}

export async function getPurchaseHistory(): Promise<UserPurchase[]> {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection<UserPurchase>('user_purchases');
    return collection.find({}).toArray();
}

export async function getUsers(): Promise<User[]> {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection<User>('users');
    return collection.find({}).toArray();
} 