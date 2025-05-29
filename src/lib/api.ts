export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

export const endpoints = {
    products: `${API_URL}/api/products`,
    productIds: `${API_URL}/api/product-ids`,
    recommendations: `${API_URL}/api/recommendations`,
    trending: `${API_URL}/api/trending`,
    search: `${API_URL}/search`,
    purchase: `${API_URL}/api/purchase`,
    boughtTogether: `${API_URL}/api/bought-together`,
}; 