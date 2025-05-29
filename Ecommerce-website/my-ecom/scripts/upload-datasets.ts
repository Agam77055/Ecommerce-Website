import { MongoClient, ServerApiVersion } from 'mongodb';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

if (!process.env.MONGODB_URI) {
    throw new Error('Please define MONGODB_URI in .env file');
}

const client = new MongoClient(process.env.MONGODB_URI, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function uploadDatasets() {
    try {
        await client.connect();
        console.log('Connected to MongoDB');

        const db = client.db('ecommerce_db');
        
        // Upload user purchases
        const purchasesPath = path.join(process.cwd(), 'server/dataset/user_purchases.json');
        const purchasesData = JSON.parse(fs.readFileSync(purchasesPath, 'utf-8'));
        const purchasesCollection = db.collection('user_purchases');
        await purchasesCollection.deleteMany({});
        const purchasesResult = await purchasesCollection.insertMany(purchasesData);
        console.log(`Successfully uploaded ${purchasesResult.insertedCount} user purchases`);

        // Upload users data
        const usersPath = path.join(process.cwd(), 'server/dataset/users_data.json');
        const usersData = JSON.parse(fs.readFileSync(usersPath, 'utf-8'));
        const usersCollection = db.collection('users');
        await usersCollection.deleteMany({});
        const usersResult = await usersCollection.insertMany(usersData);
        console.log(`Successfully uploaded ${usersResult.insertedCount} users`);

    } catch (error) {
        console.error('Error uploading datasets:', error);
    } finally {
        await client.close();
        console.log('Disconnected from MongoDB');
    }
}

uploadDatasets(); 