const express = require("express");
const cors = require("cors");
const { spawn } = require("child_process");
const path = require('path');
const fs = require("fs");
const os = require("os");
const axios = require('axios');
const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

// Load environment variables from .env file in development
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
}

class EcommerceServer {
    constructor() {
        this.app = express();
        this.PORT = process.env.PORT || 5001;
        this.productsCache = null;
        this.lastFetchTime = 0;
        this.CACHE_DURATION = 3600000; // 1 hour
        this.client = new MongoClient(process.env.MONGODB_URI);
        this.db = null;
        
        this.initializeMiddleware();
        this.initializeDatabase();
        this.setupRoutes();
    }

    initializeMiddleware() {
        this.app.use(cors());
        this.app.use(express.json());
    }

    async initializeDatabase() {
        try {
            if (!process.env.MONGODB_URI) {
                throw new Error('MONGODB_URI environment variable is not set');
            }
            
            console.log('Attempting to connect to MongoDB...');
            await this.client.connect();
            console.log('Successfully connected to MongoDB');
            this.db = this.client.db('ecommerce_db');
            
            // Test the connection
            await this.db.command({ ping: 1 });
            console.log('MongoDB connection is healthy');
        } catch (error) {
            console.error('MongoDB connection error:', error);
            console.error('MongoDB URI:', process.env.MONGODB_URI ? 'URI is set' : 'URI is not set');
            process.exit(1);
        }
    }

    // Product Management
    async fetchProducts() {
        try {
            const response = await axios.get('https://dummyjson.com/products?limit=100');
            return response.data.products.map(this.normalizeProduct);
        } catch (error) {
            console.error('Error fetching products:', error);
            return [];
        }
    }

    normalizeProduct(product) {
        const normalized = {
            id: product.id,
            title: product.title,
            description: product.description,
            price: product.price,
            thumbnail: product.thumbnail,
            images: Array.isArray(product.images) ? product.images.filter(img => img !== product.thumbnail) : [], // Exclude thumbnail from images
            brand: product.brand || "Unknown",
            category: product.category,
            rating: product.rating,
            stock: product.stock,
            discountPercentage: product.discountPercentage,
            tags: Array.isArray(product.tags)
                ? product.tags.map(tag => tag.toLowerCase().replace(/\s+/g, '-'))
                : [product.category.toLowerCase().replace(/\s+/g, '-')]
        };
        return normalized;
    }

    async getProducts() {
        const now = Date.now();
        if (!this.productsCache || (now - this.lastFetchTime) > this.CACHE_DURATION) {
            this.productsCache = await this.fetchProducts();
            this.lastFetchTime = now;
        }
        return this.productsCache;
    }

    // Helper function to safely parse numbers

    formatProductForFrontend(product) {
        if (!product) {
            console.error('Received undefined product in formatProductForFrontend');
            return null;
        }

        // Add validation and default values with proper number parsing
        return {
            key: product.id || 0,
            name: product.title || '',
            description: product.description || '',
            price: product.price || 0,
            image: product.thumbnail || '', // Keep thumbnail as main image
            images: Array.isArray(product.images) ? product.images.filter(img => img !== product.thumbnail) : [], // Exclude thumbnail from images
            brand: product.brand || '',
            category: product.category || '',
            rating: product.rating || 0,
            stock: product.stock || 0,
            discountPercentage: product.discountPercentage || 0
        };
    }

    // C++ Execution Utilities
    getExecutableFile(fileName) {
        return os.platform() === 'win32' ? `${fileName}.exe` : fileName;
    }

    async runCppExecutable(executable, args = [], inputData = null) {
        return new Promise(async (resolve, reject) => {
            const executablePath = path.join(__dirname, executable);
            
            if (!fs.existsSync(executablePath)) {
                console.error(`Executable not found: ${executablePath}`);
                return reject(new Error(`Executable not found: ${executablePath}`));
            }

            console.log('Running executable:', executablePath);
            console.log('With args:', args);
            console.log('Input data length:', inputData ? inputData.length : 0);

            const process = spawn(executablePath, args, {
                cwd: path.dirname(executablePath)
            });
            
            let output = '';
            let error = '';

            process.stdout.on('data', (data) => {
                const chunk = data.toString();
                console.log('C++ stdout:', chunk);
                output += chunk;
            });

            process.stderr.on('data', (data) => {
                const chunk = data.toString();
                console.error('C++ stderr:', chunk);
                error += chunk;
            });

            process.on('close', (code) => {
                console.log('C++ process exited with code:', code);
                if (code !== 0) {
                    return reject(new Error(`Process exited with code ${code}: ${error}`));
                }
                
                try {
                    const result = JSON.parse(output);
                    console.log('Parsed C++ output:', result);
                    resolve(result);
                } catch (e) {
                    console.error('Failed to parse C++ output:', e);
                    console.error('Raw output:', output);
                    reject(new Error(`Failed to parse output: ${e.message}`));
                }
            });

            process.on('error', (err) => {
                console.error('Failed to start C++ process:', err);
                reject(new Error(`Failed to start process: ${err.message}`));
            });

            // Send input data if provided
            if (inputData) {
                process.stdin.write(typeof inputData === 'string' ? inputData : JSON.stringify(inputData));
                process.stdin.end();
            }
        });
    }

    // Route Handlers
    async handleProductIds(req, res) {
        try {
            const products = await this.getProducts();
            res.json(products.map(p => p.id));
        } catch (error) {
            console.error('Error getting product IDs:', error);
            res.status(500).json({ error: 'Failed to get product IDs' });
        }
    }

    async handleProducts(req, res) {
        try {
            const { ids } = req.query;
            if (!ids) {
                return res.status(400).json({ error: 'No product IDs provided' });
            }

            const productIds = ids.split(',').map(id => parseInt(id));
            const products = await this.getProducts();
            const requestedProducts = products
                .filter(product => productIds.includes(product.id))
                .map(this.formatProductForFrontend);
            
            res.json(requestedProducts);
        } catch (error) {
            console.error('Error getting products:', error);
            res.status(500).json({ error: 'Failed to get products' });
        }
    }

    async handleRecommendations(req, res) {
        try {
            const { userId } = req.query;
            if (!userId) {
                return res.status(400).json({ error: 'User ID is required' });
            }

            console.log('Getting recommendations for user:', userId);

            // Get all products and user purchases
            const products = await this.getProducts();
            console.log('Total products found:', products.length);

            // Find user in database to verify they exist
            const user = await this.db.collection('users').findOne({ userid: userId });
            if (!user) {
                console.error('User not found:', userId);
                return res.status(404).json({ error: 'User not found' });
            }

            const transactions = await this.db.collection('user_purchases').find({}).toArray();
            console.log('Total transactions found:', transactions.length);
            
            // Debug logging for transactions
            console.log('Sample transactions:', transactions.slice(0, 3));
            
            // Check if user has any transactions
            const userTransactions = transactions.filter(t => t.user === userId);
            console.log('User transactions:', userTransactions.length);
            
            // Prepare input data for C++ algorithm
            const inputData = {
                products: products.map(p => ({
                    _id: p.id.toString(),
                    name: p.title,
                    description: p.description,
                    price: p.price,
                    rating: p.rating,
                    tags: p.tags || []
                })),
                transactions: transactions.map(t => {
                    return { 
                        userId: t.user,
                        productId: t.product,
                        timestamp: t.timestamp
                    };
                })
            };

            // Debug logging for final input data
            console.log('Final input data structure:', {
                productsCount: inputData.products.length,
                transactionsCount: inputData.transactions.length,
                sampleTransaction: inputData.transactions[0],
                userTransactionsCount: userTransactions.length
            });

            // Use C++ recommendation algorithm
            const result = await this.runCppExecutable(
                './cpp_algorithms/user_recommend',
                [userId],
                JSON.stringify(inputData)
            );

            if (!result.recommendations || result.recommendations.length === 0) {
                console.log('No recommendations returned from C++ program');
                return res.json([]);
            }

            // Get full product details for the recommended product IDs
            const recommendations = result.recommendations
                .map(productId => {
                    const product = products.find(p => p.id.toString() === productId);
                    return product ? this.formatProductForFrontend(product) : null;
                })
                .filter(Boolean);

            console.log('Final recommendations count:', recommendations.length);
            res.json(recommendations);
        } catch (error) {
            console.error('Error getting recommendations:', error);
            res.status(500).json({ error: 'Failed to get recommendations' });
        }
    }

    async handleSearch(req, res) {
        try {
            // Get search term from either query params (GET) or body (POST)
            const searchTerm = req.query.q || req.body.searchTerm;
            
            if (!searchTerm) {
                console.error('No search term provided');
                return res.status(400).json({ error: 'No search term provided' });
            }

            console.log('Searching for:', searchTerm);

            try {
                // Get products first
                const products = await this.getProducts();
                console.log('Got', products.length, 'products');

                // Convert products to JSON string for C++ input
                const productsJson = JSON.stringify(products);
                
                // Use C++ search algorithm
                const executablePath = path.join(__dirname, 'cpp_algorithms', 'search');
                console.log('Looking for C++ executable at:', executablePath);
                
                if (!fs.existsSync(executablePath)) {
                    console.error('C++ search executable not found at:', executablePath);
                    throw new Error('Search executable not found');
                }

                const result = await this.runCppExecutable('./cpp_algorithms/search', [searchTerm], productsJson);
                console.log('C++ search result:', result);
                
                if (!result.recommendations || result.recommendations.length === 0) {
                    console.log('No recommendations found from C++ search');
                    return res.json([]);
                }

                // Get full product details for the recommended product IDs
                const searchResults = result.recommendations
                    .map(productId => {
                        const product = products.find(p => p.id === productId);
                        if (!product) {
                            console.warn(`Product with ID ${productId} not found`);
                            return null;
                        }
                        return this.formatProductForFrontend(product);
                    })
                    .filter(Boolean); // Remove any null results

                console.log('Found', searchResults.length, 'products');
                res.json(searchResults);
            } catch (cppError) {
                console.error('C++ search failed:', cppError);
                // Fallback to simple search
                console.log('Falling back to simple search');
                const products = await this.getProducts();
                const searchResults = products
                    .filter(product => this.productMatchesQuery(product, searchTerm))
                    .map(product => this.formatProductForFrontend(product))
                    .filter(Boolean); // Remove any null results
                console.log('Found', searchResults.length, 'products using simple search');
                res.json(searchResults);
            }
        } catch (error) {
            console.error('Search error:', error);
            res.status(500).json({ error: 'Failed to search products' });
        }
    }

    productMatchesQuery(product, query) {
        const searchTerm = query.toLowerCase();
        return [
            product.title,
            product.description,
            product.brand,
            product.category,
            product.rating,
            product.discountPercentage
        ].some(field => field && field.toLowerCase().includes(searchTerm));
    }

    async handleTrending(req, res) {
        try {
            const tag = req.params.tag === 'all' ? '' : req.params.tag;
            const products = await this.getProducts();
            const transactions = await this.db.collection('user_purchases').find({}).toArray();
            
            const inputData = {
                products: products.map(p => ({
                    _id: p.id.toString(),
                    name: p.title,
                    description: p.description,
                    price: p.price,
                    rating: p.rating,
                    tags: p.tags || []
                })),
                transactions: transactions.map(t => ({ productIds: t.product }))
            };

            const result = await this.runCppExecutable('./cpp_algorithms/trending', [tag || ''], JSON.stringify(inputData));
            
            if (tag === '') {
                const trendingProducts = result.global_trending
                    .map(id => products.find(p => p.id.toString() === id))
                    .filter(Boolean)
                    .map(this.formatProductForFrontend);
                return res.json(trendingProducts);
            }

            const tagProducts = result.tag_trending
                .map(id => products.find(p => p.id.toString() === id))
                .filter(Boolean)
                .map(this.formatProductForFrontend);
            
            const response = { [tag]: tagProducts };
            if (result.error) response.error = result.error;
            
            res.json(response);
        } catch (error) {
            console.error('Error fetching trending products:', error);
            res.status(500).json({ error: 'Failed to fetch trending products' });
        }
    }

    async handleCppAlgorithm(algorithm, req, res) {
        try {
            const param = req.params.userId || req.params.productId || req.body.user || req.body.cartInput;
            const result = await this.runCppExecutable(`./cpp_algorithms/${algorithm}`, [param]);
            res.json(result);
        } catch (error) {
            console.error(`Error executing ${algorithm}:`, error);
            res.status(500).json({ error: `Failed to execute ${algorithm}` });
        }
    }

    async handlePurchase(req, res) {
        try {
            const { user, product } = req.body;
            
            if (!user || !product) {
                return res.status(400).json({ error: 'User and product data required' });
            }

            // Verify user exists
            const userDoc = await this.db.collection('users').findOne({ userid: user });
            if (!userDoc) {
                console.error('User not found:', user);
                return res.status(404).json({ error: 'User not found' });
            }

            // Convert product to string format if it's an array
            const productString = Array.isArray(product) ? product.join(',') : product;

            const transaction = {
                user,
                product: productString,
                timestamp: new Date()
            };

            const result = await this.db.collection('user_purchases').insertOne(transaction);
            
            if (result.acknowledged) {
                res.json({ message: 'Purchase successful' });
            } else {
                throw new Error('Failed to insert transaction');
            }
        } catch (error) {
            console.error('Error saving purchase:', error);
            res.status(500).json({ error: 'Failed to save purchase' });
        }
    }

    async handleBoughtTogether(req, res) {
        try {
            const { productId } = req.query;
            if (!productId) {
                return res.status(400).json({ error: 'No product ID provided' });
            }

            // Get products and purchase history
            const products = await this.getProducts();
            const purchases = await this.db.collection('user_purchases').find({}).toArray();

            // Prepare input data for C++ algorithm
            const inputData = {
                products: products,
                purchases: purchases
            };

            const result = await this.runCppExecutable(
                'cpp_algorithms/brought_together',
                [productId],
                JSON.stringify(inputData)
            );

            if (!result || !result.recommendations) {
                return res.status(500).json({ error: 'Failed to get recommendations' });
            }

            // Get the recommended products details
            const recommendedProducts = products
                .filter(product => result.recommendations.includes(product.id))
                .map(this.formatProductForFrontend);

            res.json(recommendedProducts);
        } catch (error) {
            console.error('Error getting bought together recommendations:', error);
            res.status(500).json({ error: 'Failed to get recommendations' });
        }
    }

    // Route Setup
    setupRoutes() {
        // Product routes
        this.app.get('/api/product-ids', this.handleProductIds.bind(this));
        this.app.get('/api/products', this.handleProducts.bind(this));
        this.app.get('/search', this.handleSearch.bind(this));
        this.app.post('/search', this.handleSearch.bind(this));
        
        // Algorithm routes
        this.app.get('/api/trending/:tag?', this.handleTrending.bind(this));
        this.app.get('/api/recommendations/:userId', (req, res) => 
            this.handleCppAlgorithm('user_recommend', req, res));
        this.app.get('/api/favorite-categories/:userId', (req, res) => 
            this.handleCppAlgorithm('fav_category', req, res));
        this.app.get('/api/bought-together', this.handleBoughtTogether.bind(this));
        
        // Legacy routes (for backward compatibility)
        this.app.post('/recommend', (req, res) => 
            this.handleCppAlgorithm('user_recommend', req, res));
        this.app.post('/trending', (req, res) => {
            req.params.tag = req.body.category || 'beauty';
            this.handleTrending(req, res);
        });
        this.app.post('/fav_category', (req, res) => 
            this.handleCppAlgorithm('fav_category', req, res));
        this.app.post('/brought_together', (req, res) => 
            this.handleCppAlgorithm('brought_together', req, res));
        
        // Purchase route
        this.app.post('/api/purchase', this.handlePurchase.bind(this));

        // Python-based recommendation (if still needed)
        this.app.post('/userby_recommendation', this.handlePythonRecommendation.bind(this));

        // Add signup route
        this.app.post('/api/auth/signup', async (req, res) => {
            try {
                const { name, email, password } = req.body;

                if (!name || !email || !password) {
                    return res.status(400).json({ error: 'All fields are required' });
                }

                // Check if user already exists
                const existingUser = await this.db.collection('users').findOne({ email });
                if (existingUser) {
                    return res.status(400).json({ error: 'User already exists' });
                }

                // Hash password
                const hashedPassword = await bcrypt.hash(password, 10);

                // Create new user
                const newUser = {
                    name,
                    email,
                    password: hashedPassword,
                    created_at: new Date()
                };

                const result = await this.db.collection('users').insertOne(newUser);

                if (!result.acknowledged) {
                    throw new Error('Failed to create user');
                }

                // Return user data needed for login
                res.status(201).json({
                    message: 'User created successfully',
                    user: {
                        id: result.insertedId.toString(),
                        name,
                        email
                    }
                });
            } catch (error) {
                console.error('Signup error:', error);
                res.status(500).json({ error: 'Internal server error' });
            }
        });

        this.app.get('/api/recommendations', this.handleRecommendations.bind(this));
    }

    async handlePythonRecommendation(req, res) {
        try {
            const { spawn } = require('child_process');
            const pythonProcess = spawn('python', [
                path.join(__dirname, 'recommendation.py'), 
                req.body.user
            ]);
            
            let output = '';
            let error = '';
            
            pythonProcess.stdout.on('data', (data) => output += data);
            pythonProcess.stderr.on('data', (data) => error += data);
            
            pythonProcess.on('close', (code) => {
                if (code !== 0) {
                    return res.status(500).json({ error: 'Python script failed' });
                }
                try {
                    res.json(JSON.parse(output));
                } catch (e) {
                    res.status(500).json({ error: 'Failed to parse recommendations' });
                }
            });
        } catch (error) {
            console.error('Python recommendation error:', error);
            res.status(500).json({ error: 'Failed to get recommendations' });
        }
    }

    start() {
        this.app.listen(this.PORT, () => {
            console.log(`🚀 Server running on port ${this.PORT}`);
        });
    }
}

// Initialize and start server
const server = new EcommerceServer();
server.start();

module.exports = EcommerceServer;